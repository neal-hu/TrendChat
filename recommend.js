var mongo = require('mongodb');
var mongojs = require('mongojs');
//var userDB = mongojs('localhost:27017/trendChat',['Users']);
var sylvester = require('sylvester');
Matrix = sylvester.Matrix;
var user_matrix;
var dictionary;
var rating;

var num_prop = 7;
var hidden_prop = 15;
var num_user = 0;
var prop_map = {"Politics":1,"Movies":2,"Books":3,"Music":4,"NBA":5,"Financial Market":6,"High Tech":7};
var prop_topic = {1:"washington",2:"movies",3:"books",4:"music",5:"nba",6:"money",7:"tech"};
var user_map = {};


// recommandation system using svd

function _read(userCol,callback){
	var c = 1;
	console.log("ReadStart");
	var cursor = userCol.find({});
	cursor.count(function(err, count){
		num_user = count;
		user_matrix = Matrix.Zeros(num_prop, num_user);
		dictionary = Matrix.Random(num_prop, hidden_prop);
		rating = Matrix.Random(hidden_prop, num_user);
		cursor.toArray(function(err,docs){
			for (var ii in docs){
				var data = docs[ii];
				if (data.username){
					for (var v in prop_map){	
						if (data[v]){
							user_matrix.set(prop_map[v],c,data[v]);							
						}
					}
					user_map[data.username] = c;
					c = c+1;
				}
			}
			//setParams(user_matrix, dictionary, rating, user_map);
			var res = WNMF();
			// rating = res["rating"];
			// dictionary = res["dictionary"];
			//console.log(similarityMatch("test","MovieRobot",user_map));
			//console.log(similarityMatch("test","MusicRobot",user_map));
			callback(user_matrix);	
		});
	});

}

// read from database
exports.read = function(userCol, callback){
	_read(userCol, function(m){
		//console.log(user_matrix);
		callback(m);	
	}) ;
}
// make matrix
function setParams(um, d, r, up){
	user_matrix = um;
	dictionary = d;
	rating = r;
	user_map = up;
}

// run NMF
function WNMF(callback){
	var W = user_matrix.nonZerop();
	W = W.subtract(-0.00000001);
	user_matrix = user_matrix.subtract(-0.0000001);
	for (var i=1; i<30; i++){
		// dictionary = dictionary.dotMultiply(user_matrix.multiply(rating.transpose())).dotDiv(dictionary.multiply(rating.multiply(rating.transpose())));
  //       rating = rating.dotMultiply(dictionary.transpose().multiply(user_matrix)).dotDiv(dictionary.transpose().multiply(dictionary.multiply(rating)));
 	 	dictionary = dictionary.dotMultiply(W.dotMultiply(user_matrix).multiply(rating.transpose())).dotDiv((W.dotMultiply(dictionary.multiply(rating))).multiply(rating.transpose()));
        rating = rating.dotMultiply(dictionary.transpose().multiply(W.dotMultiply(user_matrix))).dotDiv(dictionary.transpose().multiply(W.dotMultiply(dictionary.multiply(rating))));
      
        // nnD = nD.*(y*x')./(nD*x*x');
        // nx = x.*(nnD'*y)./(nnD'*nnD*x);
	}
	//console.log(user_matrix.subtract(d.multiply(r)).sum());
	user_matrix = dictionary.multiply(rating);
	console.log(user_matrix);
	return {"rating": rating, "dictionary": dictionary};
}
// store to database

// go similarity
function similarityMatch(username1, username2){
	tmp = user_matrix.col(user_map[username1]).subtract(user_matrix.col(user_map[username2]));
	var maxTopic = user_matrix.col(user_map[username1]).add(user_matrix.col(user_map[username2])).maxIndex();
	return [tmp.dot(tmp), maxTopic];
}

exports.findClosestMatch = function(newUser, availableClientList, callback){
	var maxSim = -1;
	var maxTopic = -1;
	var matchUser = '';
	//console.log(rating);
	for (var u in availableClientList){
		if (availableClientList[u] != newUser){
			var sim = similarityMatch(newUser, availableClientList[u]);
			if (sim[0]>maxSim){
				maxSim = sim[0];
				maxTopic = sim[1];
				matchUser = availableClientList[u];
			}
		}
	}
	// console.log("find");
	// console.log(maxTopic);
	// console.log(prop_topic[maxTopic]);
	if (callback){
		callback(matchUser, maxSim, prop_topic[maxTopic]);
	}
	return [matchUser, prop_topic[maxTopic]];
}



