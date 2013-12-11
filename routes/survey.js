
exports.index = function(req, res){
	if (req.session.username){
		res.render('survey');
		// var mongo = require('mongodb');
		// var mongojs = require('mongojs');
		// var userDB = mongojs('localhost:27017/trendChat',['Users']);
		// var surveyTaken;
		// userDB.Users.find({"username": req.session.username}).forEach(function(err, data){
		// 	if (data){
		// 		if (data.surveyTaken == true){
		// 			res.redirect('/chat');
		// 		}else{
		// 			res.render('survey');
		// 		}
		// 	}else{
		// 		res.render('survey');				
		// 	}

		// });
	}else{
		res.redirect("/");
	}
};

exports.submit = function(req, res){

	//console.log(req.body);
	// store survey into DB
	var mongo = require('mongodb');
	var mongojs = require('mongojs');
	var userDB = mongojs('localhost:27017/trendChat',['Users']);
	var survey_info = req.body;
	survey_info.username = req.session.username;
	survey_info.surveyTaken = true;
	//console.log(survey_info);
	userDB.Users.update({"username": req.session.username},{$set: survey_info});	
	res.redirect("/chat");

}

