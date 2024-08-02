import express from 'express';
import cors from 'cors';
import connectToMongo from './database/db.js';
import mastersheet from './routes/mastersheet.js';
import client from './routes/client.js';
import users from './routes/user.js';

connectToMongo();
const app = express();
const port = 4000;

// Middleware
app.use(express.json());

// CORS configuration to allow multiple origins
const allowedOrigins = ['http://localhost:4200', 'https://www.recrutory.com'];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Available routes
app.get('/', (req, res) => {
    res.send('crm api are working');
});

app.use('/api/master', mastersheet);
app.use('/api/client', client);
app.use('/api', users);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
