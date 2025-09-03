import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from  './config/db.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/',(req,res) => {
    res.send('Zuper Backend is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}: http://localhost:${PORT}`);
});
