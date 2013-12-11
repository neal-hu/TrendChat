var g = 0;

function test(param1, callback){
	callback();
}

function printg() {
	console.log(g);
}

test(1, function() {
	g = 1;
	console.log(g);
	printg();
});