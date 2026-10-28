import { createContext, useContext} from "react";

export const CurrencyContext=createContext(null);

 export function useCurrency(){
    return useContext(CurrencyContext)
 }