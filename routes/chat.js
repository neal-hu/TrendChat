
/*
 * GET home page.
 */

exports.index = function(req, res){
	if (req.session.username){
		res.render('index', {username: req.session.username});
		console.log("routing");
	}else{
		res.redirect("/");
	}
  
};