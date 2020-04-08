const WebSocketServer = require('ws').Server;
var express = require('express');
var app = express();
var https = require('https');
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
})
var port = process.env.PORT | 9080
var sslSrv = app.listen(port, function () {
   var host = sslSrv.address().address
   var port = sslSrv.address().port
   console.log("App listening at http://%s:%s", host, port)
});
/*wss = new WebSocketServer({server: sslSrv});  
console.log("WebSocket Secure server is up and running.");
var clientSet = {};
wss.on('connection', function (client, incoming_request) {
	console.log(incoming_request.url.replace('\?', ''));
	const urlParams = new URLSearchParams(incoming_request.url.replace('/?', ''));
	const myParam = urlParams.get('yuid');
	var oldClientId = clientSet[myParam];	
	clientSet[myParam]=client;
  console.log("A new WebSocket client was connected.");
  client.on('message', function (message) {
	  var msgData = JSON.parse(message);
	  var yuid = msgData['yuid'];
    wss.broadcast(message, client, yuid);
  });
});
wss.broadcast = function (data, exclude, yuid) {
  var i = 0, n = this.clients ? this.clients.length : 0, client = null;
  if (n < 1) return;
  console.log("Broadcasting message to all " + n + " WebSocket clients.");
	for (let [key, value] of Object.entries(clientSet)) {
		console.log('key :: '+key);
		var targetClient = value;
		if(targetClient === exclude) continue;
		if(yuid === key){			
			if (targetClient.readyState === targetClient.OPEN) targetClient.send(data);
				else console.error('Error: the targetClient state is ' + targetClient.readyState);
		}
	}
};*/