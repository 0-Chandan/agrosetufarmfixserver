import express from 'express';
import routes from './routes/index';
import dotenv from 'dotenv';
import errorMiddleware from './middleware/error.middleware';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

dotenv.config({
    path: './.env'
});
app.use(express.json());
app.use(routes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use(errorMiddleware);

app.listen(3000, () => {
    console.log(`Server started on port http://localhost:3000`);
}); 