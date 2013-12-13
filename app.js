
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var login = require('./routes/login');
var survey = require('./routes/survey');
var chat = require('./routes/chat');
var recommend = require('./recommend');
var sylvester = require('sylvester');
Matrix = sylvester.Matrix;
var url = 'http://api.usatoday.com/open/articles?api_key=ua2sfkxzb5473wup4nrg936g&encoding=json&most=most%20comment';

var http = require('http');
var path = require('path');
var mongo = require('mongodb');
//var monk = require('monk');
var bcrypt = require('bcrypt-nodejs');
var mongojs = require('mongojs');
var userDB = mongojs('127.0.0.1:27017/trendChat',['Users']);
var cookie = require('cookie');
//var Users = userDB.collection('Users');
var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore();
var finished = false;
var app = express();
var idUsername = {};
var idConversation = {};

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.cookieParser());
app.use(express.session({store: sessionStore, secret: '1234567890QWERTY', key: 'express.sid'}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routes
app.get('/chat', chat.index);
app.get('/', login.home);
app.get('/survey', survey.index);
app.post('/survey_post', survey.submit);
app.post('/login_post', login.submit);
app.get('/logout', function(req, res){
	req.session.destroy();
	res.redirect("/");
});
app.use(function(req, res) {
    res.redirect('/')
});

var io = require("socket.io");
var socket = io.listen(app.listen(app.get('port')));
var Conversation = require('./conversation.js');
var uuid = require('node-uuid');

socket.set("log level", 1);
var people = {};

var clients = [];
var conversations = {};
var availableClient = [];
var onlineClient = [];
var parseCookie = require('connect').utils.parseCookie;

socket.set('authorization', function (data, accept) {
    if (data.headers.cookie) {
        data.cookie = cookie.parse(data.headers.cookie);
        data.sessionID = data.cookie['express.sid'];
        // (literally) get the session data from the session store
        sessionStore.get(data.sessionID, function (err, session) {
            console.log(data.sessionID);
            if (err || !session) {
                // if we cannot grab a session, turn down the connection
                //accept('Error', false);
                accept(null, true);
            } else {
                // save the session data and accept the connection
                console.log(session);
                data.session = session;
                accept(null, true);
            }
        });
    } else {
       return accept('No cookie transmitted.', false);
    }
});

socket.on("connection", function (client){
	if (idUsername[client.handshake.username]){
		client.username = idUsername[client.handshake.username];
	}

	function recommendNews(topic, fn){
		// recommend a piece of news
		console.log(topic);
		http.get(url+'&section='+topic, function(res){
			var news = '';
			var body = '';
			res.on('data',function(chunk){
				body+=chunk;
			});
			res.on('end',function(){
				try{ 
					var response = JSON.parse(body);
					news = (response.stories)[0].description;
					link = (response.stories)[0].link;
					//console.log(news);
					if (fn){
						fn(news, link);		
					}	
				}
				catch(err){
					console.log("API down");
				}	
			});
		});
	}

	function match(username){
		// given the available client list, find a match
		recommend.findClosestMatch(username, availableClient, function(matchUser, maxSim, maxTopic){
			console.log("Trying to match");
			console.log(availableClient);
			if (matchUser){
				// create a conversation for the two people, the name is the combination of the two users
				var conversationName = matchUser+username;
				var id = uuid.v4();
				var conversation = new Conversation(id, conversationName);
				// broadcast to everyone to join if they are matched
				console.log({"username": matchUser, "conversationID": id,"conversationName": conversationName});
				// add the new conversation to conversation list
				conversations[conversationName] = conversation;			

				// add conversation information to clients
				onlineClient[matchUser].conversation = conversationName;
				onlineClient[username].conversation = conversationName;
				conversation.addPerson(username);
				conversation.addPerson(matchUser);
				// client join conversation
				onlineClient[matchUser].join(conversationName);
				onlineClient[username].join(conversationName);
				socket.sockets.in(conversationName).emit("update", username + " and "+ matchUser+ " have started a conversation. Please wait for the hottest news...");
				// remove them from available client list
				for (var i=availableClient.length-1;i>=0;i--){
					if (availableClient[i] == username || availableClient[i] == matchUser) {
						console.log(availableClient[i]+" has left the available list.");
						availableClient.splice(i,1);
					}
				}
				recommendNews(maxTopic,function(news, link){
					socket.sockets.in(client.conversation).emit('update-news', news,link);
				});
				

			}else{
				var found = false;
				for (var i=availableClient.length-1;i>=0;i--){
					if (availableClient[i] == username){
						found = true;
						break;
					}
				}
				if (!found){
					availableClient.push(username);
					console.log(username+" has joined the availableClient");
				}
				client.emit("update", "Please wait for someone to join you.");
			}
		});	
	}

	client.on("startChat", function(username){
		// push user into online list
		// client.username = username;
		if (!onlineClient[username]){
			onlineClient[username] = client;
			idUsername[client.handshake.username] = username;	
			client.username = username; 
			availableClient.push(username);
			console.log(username+" has joined the available list.");
			console.log(availableClient);
			client.emit("update", "You have connected to the server.");
			// tell everyone else
			socket.sockets.emit("update", username + " is online.");
			recommend.read(userDB.Users,function(m){
				// try match
				match(username);
			});
		}else{
			if (!onlineClient[username].conversation)
				match(username);
		}
	});

	// match function
	client.on("match", function(username){
		match(username);
	});		

	// Chat
	client.on("send", function(msg){
		//console.log(client);
		console.log("In "+client.conversation);
		if (socket.sockets.manager.roomClients[client.id]['/'+client.conversation]!= undefined){
			socket.sockets.in(client.conversation).emit("chat", client.username,msg);
		}else{
			client.emit("update", "Please wait until someone joins you.");
		}
	});
	
	// Leave a conversation 
	client.on("leaveConversation", function(){
		var tmp = client.conversation;
		var conversation = conversations[client.conversation];
		if (conversation){
			socket.sockets.in(client.conversation).emit("update", "Conversation has ended.");
			// add two people to available list
			var usernames = conversation.people;
			for (var i=0;i<usernames.length;i++){
				onlineClient[usernames[i]].leave(conversation.name);
				onlineClient[usernames[i]].conversation = '';
			} 
			// delete conversation
			delete conversations[tmp];
		}
	});

	// Disconnect
	client.on("disconnect", function(){
		console.log("connection lost");
		var conversation = conversations[client.conversation];
		var tmp = client.conversation;
		if (conversation){
			socket.sockets.in(client.conversation).emit("update", "Conversation has ended.");
			// add two people to available list
			var usernames = conversation.people;
			for (var i=0;i<usernames.length;i++){
				if (usernames[i] == client.username){
					console.log(client.username+" has left the server");
					delete onlineClient[client.username];
				}else{
					onlineClient[usernames[i]].leave(conversation.name);
					onlineClient[usernames[i]].conversation = '';
				}
			} 
			// delete conversation
			delete conversations[tmp];			
		}
	});
	//Sign up
	client.on("signup", function(userdata){
		if (userdata.username && userdata.password){
			//var collection = db.get('usercollection');
			finished = false;
			userDB.Users.find({"username": userdata.username}).forEach(function(err, data){
				if (finished == true) return;
				if (!data){
					bcrypt.hash(userdata.password, null, null, function(err, hash) {
						userDB.Users.insert({"username": userdata.username, "password": hash}, function(err, data){
							if (err){
								client.emit("signup_result","failed");
								finished = true;
							}else{
								client.emit("signup_result", "succeeded");
								finished = true;
							}
						});				
					});	
					finished = true;
				}else{
					client.emit("signup_result","failed");
					finished = true;
				}
			});		
		}		
	});

	// Login
	client.on("login", function(userdata){
		if (userdata.username && userdata.password){
			//var collection = db.get('usercollection');
			finished = false;
			userDB.Users.find({"username": userdata.username}).forEach(function(err, data){
				console.log(finished);
				if (finished == true) return;
				if (!data){
					client.emit("login_result","failed");
					finished = true;
				}else{
					bcrypt.compare(userdata.password, data.password, function(err, res) {
						if (res){
							client.emit("login_result", data.username);
							finished = true;
						}else{
							client.emit("login_result","failed");
							finished =  true;
						}
					});		
					finished = true;	
				}
			});				
		}
	});



})


console.log("Listening on port "+ app.get('port'));
