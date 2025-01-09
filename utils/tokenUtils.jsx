import { jwtDecode } from 'jwt-decode'

export const decodeAndSetConfig = (setConfig,token) => {
    try {
        console.log("Token :->", token);
        
        if (!token) {
            // console.error("Error decoding token");
            return;
        }
        const decodedToken = jwtDecode(token);
        setConfig(decodedToken);
    } catch (error) {
        console.error("Error decoding token", error);
    }
};