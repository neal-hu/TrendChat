window.onload = function() {
	var script = document.createElement("script");
	var form = document.createElement("form");
	var survey = ["Politics","Movies","Books","Music","NBA","Financial Market","High Tech"];
	var index = [];
	for(var i=0; i<survey.length; i++){
		index.push(0);
	}
	var count = 0;
	while (count<3){
		var r = Math.floor((Math.random()*survey.length));
		if (index[r] == 0){
			index[r] = 1;
			count++;
		}
	}
	var question = [];
	//var questionString = 'question = [';
	for(var i =0; i<survey.length; i++){
		if (index[i] == 1){
			question.push(survey[i]);
		}
	}
	//questionString += question.toString() + '];';
	window.isValidRadio = function(radio){
		var valid = false; 
		for (var i=0; i <radio.length; i++){ 
			if (radio[i].checked){
				return true;
			}
		}
		return false;
	}

	window.validateForm = function(){
		f = document.forms["survey"];
	 	for (var i=0; i < question.length; i++){
	 		if (!isValidRadio(f[question[i]])) {
	 			alert("Please finish the survey");
	 			return false;
	 		}
	 	}
	 	return true;
	}



	var interst = ["Very Interesting", "Interesting", "Just OK", "Not Interesting"];
	form.setAttribute("name", "survey")
	form.setAttribute("method", "post");
	form.setAttribute("action", "/survey_post");
	form.setAttribute("class","likert notranslate col5 hideNumbers")
	form.setAttribute("onsubmit", "return validateForm();")
	form.setAttribute("style", "margin: 1cm")
	for(var i=0; i<question.length;i++){
		var para = document.createElement('p');
		para.textContent = "How do you think about "+question[i];
		form.appendChild(para);
		for (var j=0; j<interst.length; j++){
			var label = document.createElement("label");
			var field = document.createElement("input");
			label.setAttribute("class","radio")
			field.setAttribute("type", "radio");
			field.setAttribute("name", question[i]);
			field.setAttribute("value", 4-j);
			field.setAttribute("id", question[i]+(j+1).toString());		
			label.appendChild(field);
			label.innerHTML += interst[j]+"<br />";
			form.appendChild(label);
		}
	}
	var input = document.createElement("input");
	input.setAttribute("type","submit");
	input.setAttribute("value","submit");
	input.setAttribute("class","btn btn-default");
	form.appendChild(input);

	document.body.appendChild(form);

}