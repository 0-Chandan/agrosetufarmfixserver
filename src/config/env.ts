import dotenv from 'dotenv';

dotenv.config();

const ENV = {
    Port: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET 
};

export default ENV;