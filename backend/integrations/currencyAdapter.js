import {z} from 'zod';
import { fetchJson } from '../lib/fetchJson';

const BASE_URL='https://api.frankfurter.dev/v1';

const CACHE_MS =
  Number(process.env.CURRENCY_CACHE_SECONDS ?? 3600) * 1000;

let cache = null;

const frankfurterRates=z.object({
    amount:z.number().positive(),
    base:z.string(),
    date:z.string(),
    rates:z.record(z.number().positive())
})

export async function getRates(base='sek', symbols=['SEK','EUR','USD','DkK']){
    
        const url=new URL(`${BASE_URL}/latest`);
        url.searchParams.set('base',base);
        url.searchParams.set('symbols',symbols.join(','));

        if (cache && cache.expiresAt > Date.now()) {
         return {...cache.value, fromCache:true};
        }
    
        const data=await fetchJson(url.toString());
        const result=frankfurterRates.safeParse(data);
        if(!result.success){
            throw new Error(`Invalid response from Frunkfurter:\n${z.prettifyError(result.error)}`)
        }

        const value= {
          base: result.data.base,
          date: result.data.date,
          rates: result.data.rates
        }
        cache={value, expiresAt:Date.now()+CACHE_MS};
      return {...value, fromCache:false};
        
   
}