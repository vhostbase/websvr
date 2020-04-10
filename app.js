const WebSocketServer = require('ws').Server;
var express = require('express');
var app = express();
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
})
var server = app.listen(process.env.PORT, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("App listening at http://%s:%s", host, port)
});
wss = new WebSocketServer({server: server});  
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
	if(msgData['closeConnection']){
		var fromYuid = msgData['fromYuid'];
		var toYuid = msgData['toYuid'];
		var set = Object.entries(clientSet);
		for (let [key, value] of set) {
			if(key === fromYuid || key === toYuid){
				wss.dispatch(message, value);
				value.close();
				value.terminate();				
				delete clientSet[key];
			}
		}
	}else if(msgData['verifyCaller']){
		var toYuid = msgData['yuid'];
		var id = clientSet[toYuid];
		var statusCd = 0;
		if(id){
			statusCd = 1;
		}
		wss.dispatch("{\"verifyCaller\": true, \"status\": \""+statusCd+"\"}", client);
	}else{
		var yuid = msgData['yuid'];
		wss.broadcast(message, client, yuid);	
	}
  });
});

wss.broadcast = function (data, exclude, yuid) {
  /*var i = 0, n = this.clients ? this.clients.length : 0, client = null;
  if (n < 1) return;
  console.log("Broadcasting message to all " + n + " WebSocket clients.");*/
	for (let [key, value] of Object.entries(clientSet)) {
		console.log('key :: '+key);
		var targetClient = value;
		//if(targetClient === exclude) continue;
		if(yuid === key){			
			if (targetClient.readyState === targetClient.OPEN) targetClient.send(data);
				else console.error('Error: the targetClient state is ' + targetClient.readyState);
		}
	}
};
wss.dispatch = function(data, targetClient){
	if (targetClient.readyState === targetClient.OPEN) targetClient.send(data);
	else console.error('Error: the targetClient state is ' + targetClient.readyState);
};
wss.on('close', function (client, incoming_request) {
	console.log('Closed');
});