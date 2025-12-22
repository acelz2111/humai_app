// Assuming your existing structure. Adjust IP_ADDRESS as necessary.
const IP_ADDRESS = "192.168.101.8"; 
const BASE_URL = `http://${IP_ADDRESS}/HumAI`;

export const API = {
    LOGIN: `${BASE_URL}/backend/login.php`,
    SIGNUP: `${BASE_URL}/backend/signup.php`,
    GET_DISEASE: `${BASE_URL}/backend/get_disease.php`,
    GET_DIAGNOSIS_COUNT: `${BASE_URL}/backend/get_diagnosis_count.php`,
    GET_TOP_DISEASES: `${BASE_URL}/backend/get_top_diseases.php`,
    GET_HISTORY: `${BASE_URL}/backend/get_history.php`,
    // ✅ NEW ENDPOINT for recent diagnosis
    GET_RECENT_DIAGNOSIS: `${BASE_URL}/backend/get_recent_diagnosis.php`, 
};

export const COLORS = {
    PRIMARY_GREEN: '#18B949',
    DARK_GREEN: '#1D492D',
    WHITE: '#FFFFFF',
    LIGHT_TEXT: '#b1ebd7',
    CARD_BG: "#F6FFF7",
    MODERN_BORDER: "#E5E5E5",
};