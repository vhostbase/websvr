http = require('http');

var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
})
var port = process.env.PORT | 8080

sslSrv = http.createServer(app).listen(port);
console.log("The HTTPS server is up and running");