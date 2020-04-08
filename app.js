const WebSocketServer = require('ws').Server;
express = require('express'),
  https = require('https'),
  app = express(),
  fs = require('fs');
var clientSet = {};
/*const pkey = fs.readFileSync('./ssl/key.pem'),
  pcert = fs.readFileSync('./ssl/cert.pem'),
  options = {key: pkey, cert: pcert, passphrase: '123456789'};*/
var wss = null, sslSrv = null;
// use express static to deliver resources HTML, CSS, JS, etc)
// from the public folder 
app.use(express.static('public'));

app.use(function(req, res, next) {
  if(req.headers['x-forwarded-proto']==='http') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  next();
});
var port = process.env.PORT | 8080;
// start server (listen on port 443 - SSL)
/*sslSrv = https.createServer(options, app).listen(port, function () {
   var host = sslSrv.address().address
   var port = sslSrv.address().port
   console.log("App listening at http://%s:%s", host, port)
});
console.log("The HTTPS server is up and running ");*/
 sslSrv = https.createServer(app).listen(port, function () {
   var host = sslSrv.address().address
   var port = sslSrv.address().port
   console.log("App listening at http://%s:%s", host, port)
 });
// create the WebSocket server
wss = new WebSocketServer({server: sslSrv});  
console.log("WebSocket Secure server is up and running.");
/** successful connection */
wss.on('connection', function (client, incoming_request) {	
	console.log(incoming_request.url.replace('\?', ''));
	const urlParams = new URLSearchParams(incoming_request.url.replace('/?', ''));
	const myParam = urlParams.get('yuid');
	clientSet[myParam]=client;
  console.log("A new WebSocket client was connected.");
  /** incomming message */
  client.on('message', function (message) {
	  var msgData = JSON.parse(message);
	  var id = msgData.yuid;
	  var tgtClient = clientSet[id];
    /** broadcast message to all clients */
    wss.broadcast(message, client, tgtClient);
  });
});
// broadcasting the message to all WebSocket clients.
wss.broadcast = function (data, exclude, tgtClient) {
  var i = 0, n = this.clients ? this.clients.length : 0, client = null;
  if (n < 1) return;
  console.log("Broadcasting message to all " + n + " WebSocket clients.");
  if (tgtClient.readyState === tgtClient.OPEN) tgtClient.send(data);
	else console.error('Error: the client state is ' + tgtClient.readyState);
};