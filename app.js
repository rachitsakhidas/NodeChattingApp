var express = require('express'),
	path = require('path'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	usernameList = [];
	
server.listen(3000);

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	var username = null;
	console.log('testing');
	socket.on('join', function(name, callback){
		if(usernameList.indexOf(name) !== -1){
			callback(false);
		}else{
			callback(true);
			usernameList.push({'name': name});
			socket.nickname = name;	
			io.sockets.emit('new message',{'newMsg': name + ": joined room", 'usernameList': usernameList});
		}
	});

	socket.on('sendmessage', function(data){
		if(data.typeUserName){
			updateArray({'searchVal': data.typeUserName, 'field': 'isType'});
		}
		io.sockets.emit('send new message', {'username': data.typeUserName, 'messageVal': data.messageVal, 'usernameList': usernameList});
	}).on('is typing', function (data) {
		for (var i = 0; i < usernameList.length; i++) {
			if(usernameList[i].name === data){
				usernameList[i].isType = true;
				break;
			}
		};
    	io.sockets.emit('typing', {'username': data, 'usernameList':  usernameList});
  	}).on('disconnect', function(data){
  		console.log(socket.nickname);
  		if(socket.nickname){
  			spliceFromArray({'searchVal': socket.nickname});	
  		}
  		io.sockets.emit('disconnected', socket.nickname);
  	});

  	function spliceFromArray(obj){
  		for (var i = 0; i < usernameList.length; i++) {
			if(usernameList[i].name === obj.searchVal){
				usernameList.splice(i,1);
				break;
			}
		}
  	}

  	function updateArray(obj){
  		for (var i = 0; i < usernameList.length; i++) {
			if(usernameList[i].name === obj.searchVal){
				usernameList[i][obj.field] = undefined;
				break;
			}
		}	
  	}
});