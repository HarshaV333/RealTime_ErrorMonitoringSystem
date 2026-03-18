const express = require('express');
const app = express();
const errorLogger = require('./middlewares/errorLogger');

require('dotenv').config();

app.use(express.json());

app.get('/', (req, res) => {
    res.send(`<h1>Hello</h1>`)
})

app.post('/pass', (req, res) => {
    return res.status(200).json({
        success: true,
        message: "post request passed"
    })
})

app.post('/fail', async (req, res, next) => {
    try {

        throw new Error("Database connection Failure");
        
    } catch (error) {
        next(error);
    }
})

// post request coming from python to notify
app.post('/internal/notify', (req, res, next) => {
    try {
        const {id, endpoint, method, severity, location, message} = req.body;
        if(!id || !endpoint || !method || !severity || !location || !message){
            return res.status(400).json({
                success: false,
                message: "Missing analysis data from python worker"
            })
        }
        // TODO: write websocket to directly update error to client
        res.status(200).json({
            success: true,
            message: "Successfully sent Notification to client"
        })
    } catch (error) {
        console.log("error", error)
        next(error)
    }
})

app.use(errorLogger);

app.listen(3000, () => {
    console.log("server is running at PORT: 3000");
})