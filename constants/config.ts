// constants/Config.ts

// 1. CHANGE THIS IP to your computer's current IP
const IP_ADDRESS = "172.16.54.179"; 

// 2. Base URL
const BASE_URL = `http://${IP_ADDRESS}/humai`;

// 3. Export specific endpoints
export const API = {
    LOGIN: `${BASE_URL}/api/login.php`,
    SIGNUP: `${BASE_URL}/api/signup.php`,
    // Add other endpoints here later
};