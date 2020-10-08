var express = require('express');
var body_parser = require('body-parser')
var app = express();
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

const uri = 'mongodb+srv://dbUser:dbUserPassword@cluster0.fusnr.gcp.mongodb.net/Cluster0?retryWrites=true&w=majority';

app.use(express.static(__dirname));
app.use(body_parser.json())
app.use(body_parser.urlencoded({extended: false}))

mongoose.Promise = Promise;

var Message = mongoose.model('Message', {
    name: String,
    message: String
})

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages)=>{
        res.send(messages)
    })
})

app.post('/messages', (req, res) => {
    var message = new Message(req.body)
    message.save((err) =>{
        io.emit('message', req.body)
        res.sendStatus(200)
    })
})

io.on('connection', (socket) => {
    console.log('a user connected')
})

mongoose.connect(uri, { useUnifiedTopology: true }, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'))

var server = http.listen(3000 , ()=>{
    console.log("server is listening to port", server.address().port)
})

io.listen(server)