
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
