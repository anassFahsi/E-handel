import jwt from 'jsonwebtoken';
 import { z } from "zod";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? ''
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL ?? ''

if (!CLIENT_ID || !CLIENT_SECRET || !CALLBACK_URL) {
  throw new Error('Google is not configured. Copy .env.example to .env and fill in the GOOGLE_ values.')
}

const GoogleClaimsSchema = z.object({
  sub: z.string(),
  email: z.email(),
  email_verified: z.boolean(),
  iss: z.string(),
  aud: z.string(),
  exp: z.number(),
  name: z.string().optional()
});

export function getAuthorizeUrl(state , codeChallenge) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: 'openid email profile', 
    redirect_uri: CALLBACK_URL, 
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeCode(code  , codeVerifier) { 
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: CALLBACK_URL,
    }),
    signal: AbortSignal.timeout(5_000),
  })
  const answer= await response.json()
  if (!response.ok || !answer.id_token) {
    throw new Error(`Google refused the code: ${answer.error ?? response.status}`)
  }

const claims = jwt.decode(answer.id_token)
 
const parsed =
  GoogleClaimsSchema.safeParse(claims);

if (!parsed.success) {
    throw new Error(
        "Invalid Google ID token"
    );
}
const googleUser = parsed.data;
  if (googleUser.iss !== 'https://accounts.google.com' && googleUser.iss !== 'accounts.google.com') {
    throw new Error('The ID token is not from Google')
  }

  if (googleUser.aud !== CLIENT_ID) throw new Error('The ID token is for another app')
  if (!googleUser.exp || googleUser.exp * 1000 < Date.now()) throw new Error('The ID token has expired')

 return {
  sub: googleUser.sub,
  email: googleUser.email,
  emailVerified:googleUser.email_verified,
  name:googleUser.name ?? googleUser.email,
}
  
}