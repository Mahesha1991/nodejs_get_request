var express = require('express');
var router = express.Router();
var url = require('url');

/* Calculate */


//This function will sepearate each individual unit

function splitAndReplace(exp) {

  var finalExp = [];

  exp = exp.split(/(\(|\)|\*|\/)/g);

  for (var i = 0; i < exp.length; i++) {
    if (exp[i] == '') {
      continue;
    }
    finalExp.push(exp[i]);
  }

  console.log("in split " + finalExp);
  return finalExp;

}


//If the token is variable return its value
//else return 0
function isVariable(token) {

  switch (token) {
    case 'minute':
    case 'min':
      return 60;
    case 'hour':
    case 'h':
      return 3600;
    case 'day':
    case 'd':
      return 86400;
    case 'degree':
    case '°':
      return (Math.PI / 180);
    case "'":
      return (Math.PI / 10800);
    case 'second':
    case '"':
      return (Math.PI / 648000);
    case 'hectare':
    case 'ha':
      return 10000;
    case 'litre':
    case 'l':
      return 0.001;
    case 'tonne':
    case 't':
      return 1000;
    default:
      return 0;
  }
}

//Calculate the expression
function calculate(op, second, first) {
  switch (op) {
    case '*':
			console.log(first);
      return first * second;
    case '/':
		 console.log(first);
      return first / second;
  }
  return 0;
}

//To see it its a operator or '(' or ')'
function checkPrecedence(a, b) {
  if (b == '(' || b == ')')
    return false;
  else
    return true;
}


//Evaluation of expression using stack algorithm
function validate(exp) {
  var valueStack = [];
  var opStack = [];

  for (var i = 0; i < exp.length; i++) {
    var token = exp[i];
    console.log(token);
    if (isVariable(token) > 0) {
      //console.log(isVariable(token));
      valueStack.push(isVariable(token));
    } else if (token == '(') {
      opStack.push(token);
    } else if (token == ')') {
		//	console.log(opStack[opStack.length - 1]);
      while (opStack.length > 0  && opStack[opStack.length - 1] != '(') {
				var second = valueStack.pop();
				var first = valueStack.pop();
				if(second && first){
					valueStack.push(calculate(opStack.pop(), second,first));
				}else{
					return 0;
				}

      }
			if(opStack.length > 0){
				opStack.pop();
			}else{
				return 0;
			}

    } else if (token == '*' || token == '/') {
      while (opStack.length != 0 && checkPrecedence(token, opStack[opStack.length - 1])) {
				second = valueStack.pop();
				first = valueStack.pop();
				if(second && first){
					valueStack.push(calculate(opStack.pop(), second,first));
				}else{
					return 0;
				}
      }
      // Push current token to 'ops'.
      opStack.push(token);
    } else {
      return 0;
    }
			//(       degree
  }
  while (opStack.length != 0) {
		console.log(opStack);
    valueStack.push(calculate(opStack.pop(), valueStack.pop(), valueStack.pop()));

  }
  var stackPop = valueStack.pop();

  //console.log(stackPop);
  //console.log(stackPop.toFixed(14));

  //If stack is non-empty, it means operators are not used in the input expression
  if (valueStack.length == 0) {
    return stackPop;
  }
  return 0;
}

//Send the appropriate conversion
function replaceUnit(exp) {
  switch (exp) {
    case 'minute':
    case 'min':
    case 'hour':
    case 'h':
    case 'day':
    case 'd':
      return "s";
    case 'degree':
    case '°':
    case "'":
    case 'second':
    case '"':
      return "rad";
    case 'hectare':
    case 'ha':
      return "m" + "2".sup();
    case 'litre':
    case 'l':
      return "m" + "3".sup();
    case 'tonne':
    case 't':
      return "kg";
    default:
      return exp;
  }
}


//To output the string in the required format.
function strConvert(exp) {

  for (var i = 0; i < exp.length; i++) {
    exp[i] = replaceUnit(exp[i]);
  }
  return exp;
}


// This function will get the url and send the appropriate result
function parseURL(req, res, next) {

  var queryURL = url.parse(req.originalUrl).query;


  //This will contain the expression which has to be evaluated
  console.log(req.query.units);
  expression = decodeURI(req.query.units);
  console.log(expression);
  //The input string is converted to array
  var finalExp = splitAndReplace(expression);
  console.log(finalExp);

  // This variable will have either valid result of the expression or it will have zero
  var holdNum = validate(finalExp);



  //convert the expression in the required form to put in units_name
  var unitConversion = strConvert(finalExp).join("");
  console.log(holdNum);


  finalJSON = {
    "unit_name": unitConversion,
    "multiplication_Factor": Number.parseFloat(holdNum).toPrecision(14)
  }

  //If holdNum is 0 the input is not a valid string
  if (holdNum != 0) {
    res.send(JSON.stringify(finalJSON));
  } else {
    res.send("Wrong Input");
  }

}

router.get('/', parseURL);


module.exports = router;
