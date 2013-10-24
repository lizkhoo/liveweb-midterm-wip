// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
httpServer.listen(8080);

function requestHandler(req, res) {
	// Read index.html
	fs.readFile(__dirname + '/index.html', 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading index.html');
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
  		}
  	);
}


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);
var clients = new Array();
var ifseeall = false;

var activeuser = 0; // index of active user
pacg_ = new Array();
var allnicks = new Array();

var lengt = 0;
// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);
		
        var usernumber = null;
        usernumber = clients.length;
		clients[usernumber] = socket.id;

		// When this user "send" from clientside javascript, we get a "message"
		// client side: socket.send("the message");  or socket.emit('message', "the message");
		socket.emit('set_id', usernumber);
		
		socket.on('addnick', function(nick){
			socket.nick = nick;
			allnicks.push(nick);
			socket.broadcast.emit('addnewuser', nick);
			socket.emit('fulluserlist', allnicks);
		})

        socket.on('message', 
			// Run this function when a message is sent
			function (messagetxt) {
				console.log("message: " + messagetxt);
				
				// To all clients, on io.sockets instead
				pacg_.push(messagetxt);
				lengt = pacg_.length;
				
				//data.thismessage = message
				
				io.sockets.emit('fullmessage', {themessage: messagetxt, thelength: lengt, thenicknames: allnicks});
                               // io.sockets.emit('pacag',lengt);
				console.log("pacag's lengt" + lengt);
			
			}
		);
    
           socket.on('seeall', function(data){
		      io.sockets.emit('seeall',pacg_);
	       });

		
		socket.on('disconnect', function() {

			var spliced = clients.splice(clients.indexOf(socket.id),1);			
			console.log("disconnected/removed: " + spliced);
		});
	}
);
