const express = require('express');
const errorLogger = require('./middlewares/errorLogger');
const {createServer} = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

require('dotenv').config();

const app = express();
// create a socket.io server
const server = createServer(app);

// 1. Initialize socket.io
const io = new Server(server, {
    cors:{
        origin: process.env.client_url, // client url
        methods: ["*"]
    }
});

// 2. Attach io to app object so it's accessible in routes
app.set('socketio', io)
app.use(cors());
app.use(express.json());
// 3. Socket connection
io.on('connection', (socket) => {
    console.log("A dashboard client connected", socket.id);

    socket.on('disconnect', () => {
        console.log("Dashboard client disconnected")
    })
})

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
        // websocket to directly update error to client
        req.app.get('socketio').emit('new_error', {
            id, endpoint, method, severity, location, message
        });
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

server.listen(4000, () => {
    console.log("server is running at PORT: 4000");
})