const WebSocketServer = require('ws').Server;
var express = require('express');
var app = express();
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
})
var server = app.listen(8004, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("App listening at http://%s:%s", host, port)
});
wss = new WebSocketServer({server: server});  
console.log("WebSocket Secure server is up and running.");
wss.endMeeting = function(message, client){
	var allClients = this.clients;
	var myRoomId = findRoomId(client);
	allClients.forEach((targetClient) => {
		var chatRoomId = findRoomId(targetClient);
		if(chatRoomId === myRoomId){
			wss.dispatch(message, targetClient);
			targetClient.close();
			targetClient.terminate();
		}
	});
};
wss.leftMeeting = function(message, client){	
	wss.dispatch(message, client);
	client.close();
	client.terminate();
};
wss.informConnection = function(uid, client){
	wss.broadcast(message, client);
};
wss.on('connection', function (client, incoming_request) {
	console.log(incoming_request.url.replace('\?', ''));
	const urlParams = new URLSearchParams(incoming_request.url.replace('/?', ''));
	const myRoomId = urlParams.get('chatroom');
	const yuid = urlParams.get('yuid');
	const role = urlParams.get('role');
	var uid = myRoomId+'|'+yuid;
	if(role)
		uid +='|'+role;
	//wss.informConnection(uid, client);
	client.id = uid;	
	console.log("ChatRoom Size :"+this.clients.size);
	console.log("A new WebSocket client was connected.");
  client.on('message', function (message) {
	 var msgData = JSON.parse(message);
	 if(msgData['closeConnection']){
		  wss.endMeeting(message, this);
	}else if(msgData['activateCall']){
		wss.broadcast(message, this);
	}else if(msgData['getMembers']){
		var conferrence = msgData['conferrence'];
		wss.getMembersByMeetingId(this, conferrence);
	}else{
		wss.broadcast(message, this);
	}
  });
});
function isAdmin(client){
	return findAdminId(client).toLowerCase() === 'admin';
}
function findRoomId(client){
	var clientData = client.id;
	return clientData.split('|')[0];
}
function findMemberId(client){
	var clientData = client.id;
	return clientData.split('|')[1];
}
function findAdminId(client){
	var clientData = client.id;
	var arr = clientData.split('|');
	if(arr.length === 3)
		return arr[2];
	return "";
}
wss.getMembersByMeetingId = function(client, conferrence){
	var members = [];
	var allClients = this.clients;
	var myRoomId = findRoomId(client);
	allClients.forEach((targetClient) => {
		var chatRoomId = findRoomId(targetClient);
		if(chatRoomId === myRoomId){
			var memberId = findMemberId(targetClient);
			members.push({'member_id' : chatRoomId});
		}
	});
	wss.dispatch(JSON.stringify({'getMembers': true, 'members': members, 'conferrence' : conferrence}), client);
};
wss.broadcast = function (data, exclude) {
	var allClients = this.clients;
	var myRoomId = findRoomId(exclude);
	allClients.forEach((targetClient) => {
		if(targetClient === exclude) return;
		var chatRoomId = findRoomId(targetClient);
		if(chatRoomId === myRoomId){
			if (targetClient.readyState === targetClient.OPEN) targetClient.send(data);
					else console.error('Error: the targetClient state is ' + targetClient.readyState);
		}
	});
};
wss.dispatch = function(data, targetClient){
	if (targetClient.readyState === targetClient.OPEN) targetClient.send(data);
	else console.error('Error: the targetClient state is ' + targetClient.readyState);
};
wss.on('close', function (client, incoming_request) {
	console.log('Closed');
});