const BASE_URL='https://api.frankfurter.dev/v1';

export async function getRates(base='sek', symbols=['SEK','EUR','USD','IDK']){
    
        const url=new URL(`${BASE_URL}/latest`);
        url.searchParams.set('base',base);
        url.searchParams.set('symbols',symbols);
        
    try{
        const response=await fetch(url);
        const data =await response.json();

        return {
          base: data.base,
          date: data.date,
          rates: data.rates
        }
    }catch(error){
        throw new Error('Something went wrong')
    }
}