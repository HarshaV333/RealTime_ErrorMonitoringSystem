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
        // // console.log(req);
        // // console.log(res);
        // const {name, age} = req.body;
        // const response = User.findById({_id: name});
        throw new Error("Database connection Failure");

    } catch (error) {
        // console.log(error)
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "post request failed",
            Error: error.message
        })
        // next(error);
    }
})

app.use(errorLogger);

app.listen(3000, () => {
    console.log("server is running at PORT: 3000");
})