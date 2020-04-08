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
var server = app.listen(process.env.PORT, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("App listening at http://%s:%s", host, port)
});
const clientOptions = {
  hostname: 'fcm.googleapis.com',
  port: 443,
  path: '/fcm/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
	'Authorization' : 'key=AAAArH0_fRY:APA91bH5-IbDe5KL_MLcX2f6twF7PrRHuauRCN7kbLSBLywn5F6lo3j2v6_YBvN6e-RMIHZFHcKBe8NZHqvEXkR2CEbWIOs9rKLEgL0kG0v3v9hqyE7i5LtCAkViYdAAE06-4W1WNbUB'
  }
}
function sendNotification(body){
	const clientReq = https.request(clientOptions, res => {
	  console.log('statusCode: ${res.statusCode}');

	  res.on('data', d => {
		process.stdout.write(d)
	  })
	});
	clientReq.on('error', error => {
	  console.error(error)
	});

	clientReq.write(body);
	clientReq.end();
}