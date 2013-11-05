// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
httpServer.listen(7171);

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
var activeuser = 0;
var pacg_ = new Array();
var allnicks = new Array();
var lengt = 0;


io.sockets.on('connection', 
	
	function (socket) {
	
		console.log("We have a new client: " + socket.id);
		
        var usernumber = null;
        usernumber = clients.length;
		clients[usernumber] = socket.id;
		socket.emit('set_id', usernumber);
		
		socket.on('addnick', function(nick){
			socket.nick = nick;
			allnicks.push(nick);
			socket.broadcast.emit('addnewuser', nick);
			socket.emit('fulluserlist', {users: allnicks, turn: activeuser});
		})

        socket.on('message', 
			// Run this function when a message is sent
			function (messagetxt) {
				console.log("message received: " + messagetxt);
				
				pacg_.push(messagetxt);
				lengt = pacg_.length;

				activeuser++;
				io.sockets.emit('updatemessage', {themessage: messagetxt, thelength: lengt, thenicknames: allnicks, turn: activeuser});
				io.sockets.emit('fulluserlist', {users: allnicks, turn: activeuser});
			}
		);
    
       socket.on('seeall', function(data){
	      io.sockets.emit('seeall',pacg_);
       });

		
		socket.on('disconnect', function() {
			console.log(socket.nick + " has disconnected");
			for (var i = 0; i < allnicks.length; i++){
				if (socket.nick == allnicks[i]){
					allnicks.splice(i,1);
				}
			} 
			io.sockets.emit('fulluserlist', allnicks);
				
		});

	});
