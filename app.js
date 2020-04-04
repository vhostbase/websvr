const WebSocketServer = require('ws').Server,
  https = require('https'),
  fs = require('fs');
var clientSet = {};
const pkey = fs.readFileSync('./ssl/key.pem'),
  pcert = fs.readFileSync('./ssl/cert.pem'),
  options = {key: pkey, cert: pcert, passphrase: '123456789'};
var wss = null, sslSrv = null;
// start server (listen on port 443 - SSL)
sslSrv = https.createServer(options).listen(process.env.PORT, function () {
   var host = sslSrv.address().address
   var port = sslSrv.address().port
   console.log("App listening at http://%s:%s", host, port)
});
console.log("The HTTPS server is up and running ");

// create the WebSocket server
wss = new WebSocketServer({server: sslSrv});  
console.log("WebSocket Secure server is up and running.");
wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};
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