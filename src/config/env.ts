import dotenv from 'dotenv';

dotenv.config();

const ENV = {
    Port: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,


    // Cloudinary Credentials
    cloud_name: process.env.CLOUD_NAME, 
    cloud_api_key: process.env.CLOUD_API_KEY,  
    cloud_api_secret: process.env.CLOUD_API_SECRET,
    cloud_folder: process.env.CLOUD_FOLDER
};

export default ENV;