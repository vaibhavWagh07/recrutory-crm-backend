import express from 'express';
import cors from 'cors';
import connectToMongo from './database/db.js';
import mastersheet from './routes/mastersheet.js';
import client from './routes/client.js';
import users from './routes/user.js';

connectToMongo();
const app = express();
const port = 4000;

// middleware
app.use(express.json());

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:4200', // specify the allowed origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // enable to include cookies in the requests
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
