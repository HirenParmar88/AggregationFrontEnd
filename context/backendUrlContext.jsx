import React,{useState,createContext,useContext} from "react";

const BackendurlContext = createContext();

export const useBackendurlContext=()=>useContext(BackendurlContext);

export const BackendurlProvider=({children})=>{
    const [isBackendUrl, setIsBackendUrl]=useState(false);
    console.log("Set State")

    return(
        <BackendurlContext.Provider value={{isBackendUrl,setIsBackendUrl}}>
            {children}
        </BackendurlContext.Provider>
    )
}