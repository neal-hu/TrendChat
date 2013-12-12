window.onload = function() {
	//var socket = io.connect('http://54.209.164.0');
	var socket = io.connect('http://localhost:8000');
	var status = document.getElementById("status");
	var content = document.getElementById("content");
	var username = document.getElementById("username");
	var password = document.getElementById("password");
	var loginButton = document.getElementById("login");
	var signupButton = document.getElementById("signup");


	loginButton.onclick = function() {
		var name = username.value;
		var pw = password.value;
		socket.emit("login", {username: name, password: pw});
		username.value = "";
		password.value = "";
	};

	signupButton.onclick = function() {
		var name = username.value;
		var pw = password.value;
		socket.emit("signup", {username: name, password: pw});
		username.value = "";
		password.value = "";

	};

	socket.on("login_result", function (data){
		if(data == "failed"){
			status.innerHTML = "Login in failed, try again.";
		}else{
			status.innerHTML = "";
			content.innerHTML = "Welcome "+data;
			//window.location.href="/survey";
			var form = document.createElement("form");
			form.setAttribute("method", "post");
    		form.setAttribute("action", "/login_post");
	        var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", "username");
            hiddenField.setAttribute("value", data);
            form.appendChild(hiddenField);
		    document.body.appendChild(form);
		    form.submit();
		}
	});	

	socket.on("signup_result", function (data){
		if(data == "failed"){
			status.innerHTML = "Sign up in failed, try again.";
		}else{
			status.innerHTML = "Sign up succeeded.";
		}
	});

}
