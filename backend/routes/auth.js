import { Router} from 'express';
import pool from '../db.js';
import jwt from 'jsonwebtoken'
import { exchangeCode, getAuthorizeUrl } from '../integrations/googleAdapter.js'
import { randomString  , toCodeChallenge  } from '../lib/pkce.js' 


const router = Router()

const SESSION_SECONDS = 8 * 60 * 60 
const COOKIE = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }

const FLOW_COOKIE= { ...COOKIE, path: '/api/auth/google', maxAge: 10 * 60 * 1000 }


router.get('/google', (_req, res) => {
  const state = randomString()
  const codeVerifier = randomString() 
 
  res.cookie('oauth_state', state, FLOW_COOKIE);
  res.cookie('oauth_verifier', codeVerifier,
    FLOW_COOKIE
  );
 
  console.log('\n[OAUTH] 1. Sending the user to Google')
  res.redirect(getAuthorizeUrl(state  , toCodeChallenge(codeVerifier) )) 
})


router.get('/google/callback', async (req, res) => {
  const { code, state, error } = req.query
  const expectedState = req.cookies.oauth_state
   const codeVerifier = req.cookies.oauth_verifier 
  
  res.clearCookie('oauth_state', FLOW_COOKIE) // used once – then thrown away
  res.clearCookie('oauth_verifier', FLOW_COOKIE) // PKCE

  // The user clicked "Cancel" on Google
  if (error) {
    res.redirect("https://fashionhub-live.vercel.app/#/users/login?error=cancelled")
    return
  }

   console.log("CALLBACK state from cookie", expectedState)
   console.log("CALLBACK state from google URL", state)
   console.log("CALLBACK code from google URL", code)
  // Not the login WE started → stop (CSRF)
  if (typeof code !== 'string' || !expectedState || state !== expectedState) {
    res.redirect('https://fashionhub-live.vercel.app/#/users/login?error=state')
    return
  }
  if (!codeVerifier) {
  res.redirect('https://fashionhub-live.vercel.app/#/users/login?error=pkce');
  return;
 }

  try {
    const user = await exchangeCode(code  , codeVerifier ) // PKCE
    console.log('[OAUTH] 2. Google says this is:', user.email)
    if (!user.emailVerified) {
      res.redirect('https://fashionhub-live.vercel.app/#/users/login?error=not-verified')
      return
    }

    let dbUser;

    const existingUser = await pool.query(
    `
    SELECT *
    FROM users
    WHERE google_sub = $1
    `,
    [user.sub]
    );

    if (existingUser.rows.length === 0) {

    const newUser = await pool.query(
        `
        INSERT INTO users
        (
        google_sub,
        email,
        name,
        role
        )
        VALUES
        (
        $1,
        $2,
        $3,
        'user'
        )
        RETURNING *
        `,
        [
        user.sub,
        user.email,
        user.name
        ]
    );

    dbUser = newUser.rows[0];

    } else {

    dbUser = existingUser.rows[0];

    }

    const token = jwt.sign(
      { id: dbUser.id, email: dbUser.email, name: dbUser.name },
      process.env.JWT_SECRET,
      { expiresIn: SESSION_SECONDS }
    )
    res.cookie('token', token, { ...COOKIE, maxAge: SESSION_SECONDS * 1000 })
    console.log('[OAUTH] 3. Logged in - the shop\'s own cookie is set')
    res.redirect('https://fashionhub-live.vercel.app/')
  } catch (err) {
    console.error(err)
    res.redirect(res.redirect(
  "https://fashionhub-live.vercel.app/#/users/login?error=google"))
  }
})

/* --- LOGOUT: POST /api/auth/logout --- */
// React can't remove httpOnly cookies itself – the server has to.
router.post('/logout', (_req, res) => {
  res.clearCookie('token', COOKIE)
  res.json({ loggedOut: true })
})

export default router