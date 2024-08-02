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

app.use(cors());


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
