import 'dotenv/config';
import express from 'express';
import { router } from './routes/route';
import { prisma } from './db/prisma';


const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000

app.use('/api/v1', router)

app.listen(PORT, async () => {
    try {
        await prisma.$connect();
    } catch (error) {
        console.log("Error connecting with the database.");
    }
    console.log('Server is live on port ' + PORT);
})