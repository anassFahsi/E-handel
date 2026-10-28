import { useState, useEffect } from "react";
import { CurrencyContext } from "./CurrencyContext";

export function CurrencyProvider({children}){
  const [currency , setCurrency]=useState('SEK');
  const [rates , setRates]= useState({});

  useEffect(()=>{
    fetch('/api/currency/rates')
    .then(response=>response.json())
    .then(data=>setRates(data.rates))
  },[]);

  function convert(priceSek){
    if(currency==='SEK') return priceSek;
    return priceSek * (rates[currency]?? 1);
  }

  return (
  <CurrencyContext.Provider value={{currency, setCurrency, convert}}>{children}</CurrencyContext.Provider>
  )
}