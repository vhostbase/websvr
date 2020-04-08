const WebSocketServer = require('ws').Server;
var express = require('express');
var app = express();
var https = require('https');
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
})
app.post('/send', function (req, res) {
	console.log(req);
	if(req.url == '/send'){
	let body = [];
	req.on('data', (chunk) => {
	  body.push(chunk);
	}).on('end', () => {
	  body = Buffer.concat(body).toString();
	  // at this point, `body` has the entire request body stored in it as a string
	  sendNotification(body);
	});
	}else{
		res.sendFile( __dirname + "/" + "index.html" );
	}
});
var sslSrv = app.listen(process.env.PORT, function () {
   var host = sslSrv.address().address
   var port = sslSrv.address().port
   console.log("App listening at http://%s:%s", host, port)
});
wss = new WebSocketServer({server: sslSrv});  
console.log("WebSocket Secure server is up and running.");
/** successful connection */
wss.on('connection', function (client, incoming_request) {
	var clientId = client._ultron.id;
	console.log(client.upgradeReq.url.replace('\?', ''));
	const urlParams = new URLSearchParams(client.upgradeReq.url.replace('/?', ''));
	const myParam = urlParams.get('yuid');
	var oldClientId = clientSet[myParam];	
	clientSet[myParam]=clientId;
  console.log("A new WebSocket client was connected."+clientId);
  /** incomming message */
  client.on('message', function (message) {
	  var msgData = JSON.parse(message);
	  var id = msgData.yuid;
	  var tgtClientId = clientSet[id];
    /** broadcast message to all clients */
    wss.broadcast(message, client, tgtClientId);
  });
});
// broadcasting the message to all WebSocket clients.
wss.broadcast = function (data, exclude, tgtClientId) {
  var i = 0, n = this.clients ? this.clients.length : 0, client = null;
  if (n < 1) return;
  console.log("Broadcasting message to all " + n + " WebSocket clients.");
  for (i=0; i < n; i++) {
	client = this.clients[i];
	console.log("client id "+client._ultron.id);
	console.log("target id "+tgtClientId);
	if(data.indexOf('closeConnection') > -1){
		console.log("colse target id "+client._ultron.id);
		if (client.readyState === client.OPEN) client.send(data);
			else console.error('Error: the client state is ' + client.readyState);
	}else{
		// don't send the message to the sender...
		if (client._ultron.id === exclude._ultron.id) continue;
		if(tgtClientId === client._ultron.id){
			console.log('Found Client...');
			if (client.readyState === client.OPEN) client.send(data);
			else console.error('Error: the client state is ' + client.readyState);
		}
	}
  }
};