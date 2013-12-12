
/*
 * GET users listing.
 */

exports.home = function(req, res){
  res.render('login');
};

exports.submit = function(req, res){
	req.session.username = req.body.username;
	console.log(req.session.username)
	res.redirect("/survey");
};

		// #content
		// 	#update(style="width: 500px; height: 50px;border: solid 1px #999; overflow-y: scroll;")
		// 	#news(style="width: 100px; height: 200px;float: left; border: solid 1px #999; overflow-y: scroll;")
		// 	#chat(style="width: 400px; height: 200px;float: left; border: solid 1px #999; overflow-y: scroll;")
		// div(style="clear:both;")
		// 	input#field(type="text", style="width:100px;")
		// 	input#send(type="button", value="send")
		// div(style="clear:both")
		// 	input#leaveConversation(type="button", value="Leave Conversation")
		// 	input#Match(type="button", value="Match me with someone")