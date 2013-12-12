window.onload = function() {
	var username = document.getElementById("username");
	var messages = [];
	var userList = [];
	var updateList = [];
	var socket = io.connect('http://54.209.164.0');
	//var socket = io.connect('http://localhost:8000');
	var field = document.getElementById("field");
	var name = document.getElementById("name");
	var sendButton = document.getElementById("send");
	var matchButton = document.getElementById("Match");
	var leaveButton = document.getElementById("leaveConversation");
	var chatContent = document.getElementById("chat");
	var newsContent= document.getElementById("news");
	var updateContent = document.getElementById("update");
	var users = document.getElementById('users');
	var updates = document.getElementById('updates');
	var started = false;


	socket.on('chat', function (name, data){
		if(name && data){
			// messages.push(data);
			// var html = "";
			// for (var i=0; i<messages.length; i++){
			// 	html += messages[i] + '<br />';
			// }
			chatContent.innerHTML += '<div class=\"chat-msg\">';
			chatContent.innerHTML += '<strong>'+name+'<strong>';
			chatContent.innerHTML += '<span class=\"chat-delim\">:</span>';
			chatContent.innerHTML += '<span class=\"chat-text\">'+data+'</span>';
			//chatContent.innerHTML += data +'<br />';
			chatContent.innerHTML += '</div>';
			chatContent.scrollTop = chatContent.scrollHeight;
		}else {
			console.log("There is a problem:", data);
		}
	});

	socket.on('update-news', function (data){
		if(data){
			newsContent.innerHTML = "How do you guys think of this?<br />"
			newsContent.innerHTML += data;
		}
	});

	socket.on('update', function (data){
		//console.log("here");
		var tmp = '';
		tmp += data + '<br />';
		newsContent.innerHTML = tmp;

	});
	field.onkeydown = function(e) {
        if (e.keyCode === 13) {
			var text = field.value;
			socket.emit('send', text);
			field.value = "";
        }
    };

	sendButton.onclick = function() {
		var text = field.value;
		socket.emit('send', text);
		field.value = "";
	};


	leaveButton.onclick = function(){
		socket.emit('leaveConversation',username.textContent);
	};

	matchButton.onclick = function(){
		// if (!started){
		socket.emit('startChat', username.value);
		// 	started = true;
		// }else{
		// 	socket.emit('match', username.textContent);
		// }
	};

}

