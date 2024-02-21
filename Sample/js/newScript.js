var commenttext="Some Text";
var commentloc=0;


//simulation constants
var x_offset = 80; //local origin - x
var y_offset = 90; //local origin - y
var trans= new point(x_offset,y_offset);
var beamLength = 400;
var beamWidth = 10;
var support_length = 50;
var support_width = 20;
var deflection_value = 100;
var number_of_lines = 100;
var e = 200; //e in the formula
var i = 8.3333; //i in the formula

//for simply supported beam
var rollRadius = 4;
var groundWidth = 30;
var groundOffset = 50;
var init_wedge_position = beamLength;
var wedgePosition = 0;



var o= new point(0,0,"");

//graphics section
var canvas;
var ctx;
//timing section
var simTimeId = setInterval("",'1000');
var pauseTime = setInterval("",'1000');
var time=0;
//point tracing section
var ptx = [];
var pty = [];


const FIXED_BEAM = 0;
const CANTILEVER_BEAM = 1;
const SIMPLY_SUPPORTED = 2;

var scene = FIXED_BEAM;
/*
// for trials during development
function trythis()
{     alert();}
*/

//change simulation specific css content. e.g. padding on top of variable to adjust appearance in variables window
function editcss()
{
$('.variable').css('padding-top','40px');

}

//start of simulation here; starts the timer with increments of 0.1 seconds
function startsim()
{
simTimeId=setInterval("time=time+0.1; varupdate(); ",'100');
}

//Initialise system parameters here
function varinit()
{
  varchange();
  var init_a = x_offset + beamLength / 2; 
  var init_force = 0;

  $('#aslider').slider("value", init_a);  
  $('#aspinner').spinner("value", init_a);



  $('#forceslider').slider("value", init_force);  
  $('#forcespinner').spinner("value", init_force);

  $('#wedgeSlider').slider("value", init_wedge_position);  
  $('#wedgeSpinner').spinner("value", init_wedge_position);

}

// Initialise and Monitor variable containing user inputs of system parameters.
//change #id and repeat block for new variable. Make sure new <div> with appropriate #id is included in the markup
function varchange()
{
  //Variable a postion slider and number input types
  $('#aslider').slider({ max : beamLength, min : 0, step : 5 });    // slider initialisation : jQuery widget
  $('#aspinner').spinner({ max : beamLength, min : 0, step : 5 });    // number initialisation : jQuery widget  

  // monitoring change in value and connecting slider and number
  // setting trace point coordinate arrays to empty on change of link length
  $( "#aslider" ).on( "slide", function( e, ui ) { $('#aspinner').spinner("value",ui.value); ptx=[]; pty=[]; } );
  $( "#aspinner" ).on( "spin", function( e, ui ) { $('#aslider').slider("value",ui.value); ptx=[]; pty=[]; } );
  $( "#aspinner" ).on( "change", function() {  varchange() } );


  //Variable force slider and number input types
  $('#forceslider').slider({ max : 250, min : 0, step : 1 });   // slider initialisation : jQuery widget
  $('#forcespinner').spinner({ max : 250, min : 0, step : 1 });   // number initialisation : jQuery widget      
  // monitoring change in value and connecting slider and number
  // setting trace point coordinate arrays to empty on change of link length
  $( "#forceslider" ).on( "slide", function( e, ui ) { $('#forcespinner').spinner("value",ui.value); ptx=[]; pty=[]; } );
  $( "#forcespinner" ).on( "spin", function( e, ui ) { $('#forceslider').slider("value",ui.value); ptx=[]; pty=[]; } );
  $( "#forcespinner" ).on( "change", function() {  varchange() } );


  //Variable force slider and number input types
  $('#wedgeSlider').slider({ max : beamLength, min : beamLength/2, step : 2 });   // slider initialisation : jQuery widget
  $('#wedgeSpinner').spinner({ max : beamLength, min : beamLength/2, step : 2 });   // number initialisation : jQuery widget      
  // monitoring change in value and connecting slider and number
  // setting trace point coordinate arrays to empty on change of link length
  $( "#wedgeSlider" ).on( "slide", function( e, ui ) { $('#wedgeSpinner').spinner("value",ui.value); ptx=[]; pty=[]; } );
  $( "#wedgeSpinner" ).on( "spin", function( e, ui ) { $('#wedgeSlider').slider("value",ui.value); ptx=[]; pty=[]; } );
  $( "#wedgeSpinner" ).on( "change", function() {  varchange() } );


  varupdate();

}

//Computing of various system parameters
function varupdate()
{

	if(scene == SIMPLY_SUPPORTED){
		$('#wedgeSlider').slider("enable"); 
		$('#wedgeSpinner').spinner("enable"); 
    $('#forceslider').slider({ max : 100, min : 0, step : 2 });   // slider initialisation : jQuery widget
    $('#forcespinner').spinner({ max : 100, min : 0, step : 2 });   // number initialisation : jQuery widget      
		// $('#aslider').slider({ max : wedgePosition, min : 0, step : 5 });    // slider initialisation : jQuery widget
  // 		$('#aspinner').spinner({ max : wedgePosition, min : 0, step : 5 });    // number initialisation : jQuery widget
	}
	else{
		$('#wedgeSlider').slider("disable"); 
		$('#wedgeSpinner').spinner("disable"); 
    $('#forceslider').slider({ max : 250, min : 0, step : 2 });   // slider initialisation : jQuery widget
    $('#forcespinner').spinner({ max : 250, min : 0, step : 2 });   // number initialisation : jQuery widget      
	}
  $('#aslider').slider("value", $('#aspinner').spinner('value'))
  $('#forceslider').slider("value", $('#forcespinner').spinner('value')); 
  $('#wedgeSlider').slider("value", $('#wedgeSpinner').spinner('value')); 

  load_point = $('#aspinner').spinner("value");
  load = $('#forcespinner').spinner("value");
  wedgePosition = $('#wedgeSpinner').spinner("value");

  o.xcoord=0;
  o.ycoord=0;

  if(scene == FIXED_BEAM)
    drawForFixed();
  else if(scene == CANTILEVER_BEAM)
    drawForCantilever();
  else
    drawForSimplySupported();

}


/*
-------FOR   FIXED   BEAM------------------------------------------------------- 
*/

//Simulation graphics
function drawForFixed()
{
  canvas = document.getElementById("simscreen");
  ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,550,400);  //clears the complete canvas#simscreen everytime

  e *= 100;
  i *= 100; 
  support_width = 20;


  pointtrans(o,trans);

  //left support
  ctx.beginPath();  
  ctx.strokeStyle="#825723";
  ctx.lineWidth=support_width;
  ctx.moveTo(o.xcoord ,o.ycoord-(support_length/2));
  ctx.lineTo(o.xcoord ,o.ycoord+(support_length/2));
  ctx.stroke();  
  ctx.closePath();

  //right support
  ctx.beginPath();
  ctx.strokeStyle= "#825723";
  ctx.lineWidth=support_width;
  ctx.moveTo(beamLength+x_offset + support_width,o.ycoord - (support_length/2));
  ctx.lineTo(beamLength + x_offset + support_width, o.ycoord + (support_length/2));
  ctx.stroke();
  ctx.closePath();


  ctx.beginPath();
  ctx.lineWidth=beamWidth;
  ctx.strokeStyle= "#000";
 i=(Math.round(i*100)-Math.round(i)*100)/100+Math.round(i);
  def = calculatDeflectionForFixed(load_point, load, load_point, wedgePosition);
  def=(Math.round(def*100)-Math.round(def)*100)/100+Math.round(def);
  printcomment("For MildSteel, E(Gpa): 200, I(mm<sup>4</sup>): " + i +
          ",\n deflection at 'a'(mm): " + def/10
          ,0);


  var start = new point(x_offset+support_width/2, o.ycoord);
  for(var x = 0; x < number_of_lines; x++){
    ctx.moveTo(x_offset+support_width/2 + x*(beamLength/number_of_lines)
    ,calculatDeflectionForFixed(load_point, load, x*(beamLength/number_of_lines) )+ y_offset);

    ctx.lineTo(x_offset+support_width/2 + (x+1)*(beamLength/number_of_lines)
    ,calculatDeflectionForFixed(load_point, load, (x+1)*(beamLength/number_of_lines)) + y_offset);

    ctx.stroke();

  }
  ctx.closePath();  


  ctx.beginPath();
  ctx.globalAlpha=0.1;
  ctx.lineWidth=beamWidth;
  ctx.strokeStyle= "#000";
  ctx.moveTo(x_offset+support_width/2 ,o.ycoord);
  ctx.lineTo(beamLength+x_offset + support_width/2 ,o.ycoord);
  ctx.stroke();
  ctx.globalAlpha=1; 
  ctx.closePath();  

  //draw force arrow
  drawForceArrow(ctx);

  //draw SFD
  drawSfdforFixed(ctx, load, load_point);

  //draw BMD
  drawBmdforFixed(ctx, load, load_point);

  e /= 100;
  i /= 100; 


}
function calculatDeflectionForFixed(load_point, load, x){
  
  if( x <= load_point ){
    return deflectionEquationForFixed(load, load_point, x, e, i, beamLength);
  }
  else{
    return deflectionEquationForFixed(load, beamLength- load_point, beamLength-x, e, i, beamLength);
  }

    
}

function deflectionEquationForFixed(p, a, x, e, i, l){
  var b = l -a;
  return (p*b*b*x*x)*(3*a*l - 3*a*x - b*x) / (6*e*i*l*l*l);
}


function drawSfdforFixed(ctx, load, load_point){

	//left support lines

	
	pointtrans(o, new point(0,300));

	ctx.lineWidth=1;
  	ctx.strokeStyle= "#616161";


	ctx.beginPath();
	ctx.moveTo(o.xcoord + support_width/2 , o.ycoord - support_length/2);
	ctx.lineTo(o.xcoord + support_width/2, o.ycoord + support_length/2);
	ctx.stroke();
	ctx.closePath();

  

	ctx.beginPath();
	ctx.moveTo(o.xcoord + support_width/2 + beamLength, o.ycoord - support_length/2);
	ctx.lineTo(o.xcoord + support_width/2 + beamLength, o.ycoord + support_length/2);
	ctx.stroke();
	ctx.closePath();

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.moveTo(o.xcoord + support_width/2 , o.ycoord );
  ctx.lineTo(o.xcoord + support_width/2 + beamLength , o.ycoord);
  ctx.stroke();
  ctx.closePath();


  ctx.save();
  ctx.lineWidth=1;
  ctx.strokeStyle="#000000";
  ctx.fillStyle = "#000"
  ctx.font = "12px Arial";
  ctx.strokeText('SFD (N)', o.xcoord + support_width/2 , o.ycoord - support_length/2 - 15);  
  ctx.restore();


	var Ra = calculateReactionFixed(load, load_point, beamLength - load_point, beamLength);
	var Rb = calculateReactionFixed(load, beamLength - load_point, load_point, beamLength);

  ctx.save();
  ctx.lineWidth=1;
  ctx.strokeStyle="#000000";
  ctx.font = "10px Arial";
  ctx.strokeText('' + Math.ceil(Ra), o.xcoord + support_width/2 - 20, o.ycoord - support_length/2 + 15);  
  ctx.strokeText('' + Math.floor(Rb), o.xcoord + support_width/2 + beamLength + 10, o.ycoord  + 15)
  ctx.restore();

	if(Ra > support_length/2)
		Ra = support_length/2;

	if(Rb > support_length/2)
		Rb = support_length/2;

	if( Ra != 0 && Rb != 0){
    ctx.beginPath();
    ctx.lineWidth = Ra;
    ctx.moveTo(o.xcoord + support_width/2 , o.ycoord - Ra/2);
    ctx.lineTo(o.xcoord + support_width/2 + load_point , o.ycoord - Ra/2);
    ctx.stroke();
    ctx.closePath();


    
    ctx.beginPath();
    ctx.lineWidth = Rb;
    ctx.moveTo(o.xcoord + support_width/2 +load_point, o.ycoord + Rb/2);
    ctx.lineTo(o.xcoord + support_width/2 + beamLength , o.ycoord + Rb/2);
    ctx.stroke();
    ctx.closePath();
  }
	

	pointtrans(o, new point(0,300));

}

function calculateReactionFixed(P, a, b, l){
	return ((P * b * b *(3*a + b)) / pow(l,3));
}


function drawBmdforFixed(ctx, load, load_point){
	pointtrans(o, new point(0,400));

	ctx.lineWidth=1;
  	ctx.strokeStyle= "#616161";


	ctx.beginPath();
	ctx.moveTo(o.xcoord + support_width/2 , o.ycoord - support_length/2);
	ctx.lineTo(o.xcoord + support_width/2, o.ycoord + support_length/2);
	ctx.stroke();
	ctx.closePath();

	ctx.beginPath();
	ctx.moveTo(o.xcoord + support_width/2 + beamLength, o.ycoord - support_length/2);
	ctx.lineTo(o.xcoord + support_width/2 + beamLength, o.ycoord + support_length/2);
	ctx.stroke();
	ctx.closePath();

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.moveTo(o.xcoord + support_width/2 , o.ycoord );
  ctx.lineTo(o.xcoord + support_width/2 + beamLength , o.ycoord);
  ctx.stroke();
  ctx.closePath();

  ctx.save();
  ctx.lineWidth=1;
  ctx.strokeStyle="#000000";
  ctx.fillStyle = "#000"
  ctx.font = "12px Arial";
  ctx.strokeText('BMD (N-m)', o.xcoord + support_width/2 , o.ycoord - support_length/2 - 15);  
  ctx.restore();

  ctx.save();
  ctx.lineWidth=1;
  ctx.strokeStyle="#000000";
  ctx.font = "10px Arial";
  ctx.strokeText('' + Math.ceil(calculateBmdforFixed(load, load_point, 0, beamLength)), o.xcoord + support_width/2 - 20, o.ycoord  + 15);  
  ctx.strokeText('' + calculateBmdforFixed(load, load_point, 0, beamLength), o.xcoord + support_width/2 + beamLength + 10, o.ycoord  + 15)
  ctx.restore();


	ctx.beginPath();
	ctx.moveTo(o.xcoord + support_width/2, o.ycoord );
	for(var i = 0; i < beamLength; i++){
		ctx.lineTo(o.xcoord + support_width/2 + i, o.ycoord - calculateBmdforFixed(load, load_point, i, beamLength))
		ctx.moveTo(o.xcoord + support_width/2 + i +1, o.ycoord );
		ctx.stroke();
	}

	ctx.closePath();

	

}
function calculateBmdforFixed(P, a, x, l){

	if( x <= a ){
		var r = calculateReactionFixed(P, a, l - a, l);
		return (( r * x ) - ( P * a * pow((l-a),2) / pow(l,2)) )/1000;
	}
	else{
		var r = calculateReactionFixed(P, l - a, a, l);
		return (( r * (l - x) ) - ( P * (l-a) * pow(a,2) / pow(l,2)) )/1000;
	}
	
}





/*
-------FOR   CANTILEVER   BEAM------------------------------------------------------- 
*/

function drawForCantilever()
{
  canvas = document.getElementById("simscreen");
  ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,550,400);  //clears the complete canvas#simscreen everytime


  e *= 1000;
  i *= 100; 

  pointtrans(o,trans);

  //left support
  ctx.beginPath();  
  ctx.strokeStyle="#825723";
  ctx.lineWidth=support_width;
  ctx.moveTo(o.xcoord,o.ycoord-(support_length/2));
  ctx.lineTo(o.xcoord,o.ycoord+(support_length/2));
  ctx.stroke();  
  ctx.closePath();


  ctx.beginPath();
  ctx.lineWidth=beamWidth;
  ctx.strokeStyle= "#000";
 i=(Math.round(i*100)-Math.round(i)*100)/100+Math.round(i);
  def = calculatDeflectionForCantilever(load_point, load, load_point, wedgePosition);
  def=(Math.round(def*100)-Math.round(def)*100)/100+Math.round(def);
  printcomment("For MildSteel, E(Gpa): 200, I(mm<sup>4</sup>): " + i +
          ", \n deflection at 'a'(mm): " + def
          ,0);

  var start = new point(x_offset+support_width/2, o.ycoord);
  for(var x = 0; x < number_of_lines; x++){
    ctx.moveTo(x_offset+support_width/2 + x*(beamLength/number_of_lines)
    ,calculatDeflectionForCantilever(load_point, load, x*(beamLength/number_of_lines) )+ y_offset
    );

    ctx.lineTo(x_offset+support_width/2 + (x+1)*(beamLength/number_of_lines)
    ,calculatDeflectionForCantilever(load_point, load, (x+1)*(beamLength/number_of_lines) )+ y_offset);

    ctx.stroke();

  }
  ctx.closePath();  


  ctx.beginPath();
  ctx.globalAlpha=0.1;
  ctx.lineWidth=beamWidth;
  ctx.strokeStyle= "#000";
  ctx.moveTo(x_offset+support_width/2 ,o.ycoord);
  ctx.lineTo(beamLength+x_offset + support_width/2 ,o.ycoord);
  ctx.stroke();
  ctx.globalAlpha=1; 
  ctx.closePath();  

  //draw force arrow
  drawForceArrow(ctx);

  //draw SFD
  drawSfdforCantilever(ctx, load, load_point);

  //draw BMD
  drawBmdforCantilever(ctx, load, load_point);

  e /= 1000;
  i /= 100; 

}


function calculatDeflectionForCantilever(load_point, load, x){
  p = load;
  if( x <= load_point ){
    return (p*x*x)*(3*load_point-x) / (6 * e * i); 
  }
  else{
    return (p*load_point*load_point)*(3*x- load_point ) / (6 * e * i); 
  }
    
}


function deflectionEquationForCantilever(p, a, x, e, i){
  return (p*b*b*x*x)*(3*a*l - 3*a*x - b*x) / (6*e*i*l*l*l);
}

function drawSfdforCantilever(ctx, load, load_point){

  //left support lines

  
  pointtrans(o, new point(0,300));

  ctx.lineWidth=1;
    ctx.strokeStyle= "#616161";


  ctx.beginPath();
  ctx.moveTo(o.xcoord + support_width/2 , o.ycoord - support_length/2);
  ctx.lineTo(o.xcoord + support_width/2, o.ycoord + support_length/2);
  ctx.stroke();
  ctx.closePath();

  

  ctx.beginPath();
  ctx.moveTo(o.xcoord + support_width/2 + beamLength, o.ycoord - support_length/2);
  ctx.lineTo(o.xcoord + support_width/2 + beamLength, o.ycoord + support_length/2);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.moveTo(o.xcoord + support_width/2 , o.ycoord );
  ctx.lineTo(o.xcoord + support_width/2 + beamLength , o.ycoord);
  ctx.stroke();
  ctx.closePath();

  ctx.save();
  ctx.lineWidth=1;
  ctx.strokeStyle="#000000";
  ctx.fillStyle = "#000"
  ctx.font = "12px Arial";
  ctx.strokeText('SFD (N)', o.xcoord + support_width/2 , o.ycoord - support_length/2 - 15);  
  ctx.restore();

  var R = load;

  if(R > support_length/2)
    R = support_length/2;

  ctx.beginPath();
  ctx.lineWidth = R;
  ctx.moveTo(o.xcoord + support_width/2 , o.ycoord - R/2);
  ctx.lineTo(o.xcoord + support_width/2 + load_point , o.ycoord -R/2);
  ctx.stroke();
  ctx.closePath();

  ctx.save();
  ctx.lineWidth=1;
  ctx.strokeStyle="#000000";
  ctx.font = "10px Arial";
  ctx.strokeText('' + Math.ceil(load), o.xcoord + support_width/2 - 20, o.ycoord - support_length/2 + 15);  
  ctx.restore();

  pointtrans(o, new point(0,300));

}


function drawBmdforCantilever(ctx, load, load_point){
  pointtrans(o, new point(0,400));

  ctx.lineWidth=1;
    ctx.strokeStyle= "#616161";


  ctx.beginPath();
  ctx.moveTo(o.xcoord + support_width/2 , o.ycoord - support_length/2);
  ctx.lineTo(o.xcoord + support_width/2, o.ycoord + support_length/2);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(o.xcoord + support_width/2 + beamLength, o.ycoord - support_length/2);
  ctx.lineTo(o.xcoord + support_width/2 + beamLength, o.ycoord + support_length/2);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.moveTo(o.xcoord + support_width/2 , o.ycoord );
  ctx.lineTo(o.xcoord + support_width/2 + beamLength , o.ycoord );
  ctx.stroke();
  ctx.closePath();

  ctx.save();
  ctx.lineWidth=1;
  ctx.strokeStyle="#000000";
  ctx.fillStyle = "#000"
  ctx.font = "12px Arial";
  ctx.strokeText('BMD (N-mm)', o.xcoord + support_width/2 , o.ycoord - support_length/2 - 15);  
  ctx.restore();



  ctx.beginPath();
  ctx.moveTo(o.xcoord + support_width/2, o.ycoord );
  for(var i = 0; i < load_point; i++){
    ctx.lineTo(o.xcoord + support_width/2 + i, o.ycoord - calculateBmdforCantilever(load, i, load_point));
    ctx.moveTo(o.xcoord + support_width/2 + i +1, o.ycoord );
    ctx.stroke();
  }

  ctx.closePath();

  

  ctx.save();
  ctx.lineWidth=1;
  ctx.strokeStyle="#000000";
  ctx.font = "10px Arial";
  ctx.strokeText('' + 2000*Math.ceil(calculateBmdforCantilever(load, 0, load_point)), o.xcoord + support_width/2 - 50, o.ycoord  + 15);  
  // ctx.strokeText('' + calculateBmdforSimplySupported(load, load_point, 0, beamLength), o.xcoord + support_width/2 + beamLength + 10, o.ycoord  + 15)
  ctx.restore();
}

function calculateBmdforCantilever(P, x, l){
  return - P * (l - x) / 2000;
}




/*
-------FOR   Simply Supported   BEAM------------------------------------------------------- 
*/
 
function drawForSimplySupported(){
	canvas = document.getElementById("simscreen");
  ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,550,400);  //clears the complete canvas#simscreen everytime

  var support_offset = support_width/2;
  support_width = 36;
  e *= 100;
  i *= 100; 

  pointtrans(o,trans);


  //left support
  ctx.beginPath();  
  ctx.fillStyle="#825723";
  ctx.moveTo(o.xcoord + support_offset ,o.ycoord+(beamWidth/2));
  ctx.lineTo(o.xcoord + support_offset +support_width/2,o.ycoord+support_width + beamWidth/2);
  ctx.lineTo(o.xcoord + support_offset -support_width/2,o.ycoord+support_width + beamWidth/2);
  ctx.fill();
  ctx.closePath();


  ctx.beginPath();
  ctx.lineWidth=beamWidth;
  ctx.strokeStyle= "#000";
  i=(Math.round(i*100)-Math.round(i)*100)/100+Math.round(i);
  def = calculatDeflectionForSimplySupported(load_point, load, load_point, wedgePosition);
  def=(Math.round(def*100)-Math.round(def)*100)/100+Math.round(def);
  printcomment("For MildSteel, E(Gpa): 200, I(mm<sup>4</sup>): " + i +
  				", \n deflection at 'a'(mm): " + def/10
  				,0);

  var start = new point(x_offset+support_width/2, o.ycoord);
  for(var x = 0; x < number_of_lines; x++){
    ctx.moveTo(x_offset+support_offset + x*(beamLength/number_of_lines)
    ,calculatDeflectionForSimplySupported(load_point, load, x*(beamLength/number_of_lines), wedgePosition )+ y_offset);

    ctx.lineTo(x_offset+support_offset + (x+1)*(beamLength/number_of_lines)
    ,calculatDeflectionForSimplySupported(load_point, load, (x+1)*(beamLength/number_of_lines), wedgePosition  )+ y_offset);
    ctx.stroke();
  }
  ctx.closePath(); 


  var loc_org_x = o.xcoord + support_offset +  wedgePosition ; //variable for the movement of the right beam
  //right support
  ctx.beginPath();  
  ctx.fillStyle="#825723";
  ctx.moveTo(loc_org_x ,o.ycoord+(beamWidth/2));
  ctx.lineTo(loc_org_x + support_width/2 - rollRadius,o.ycoord+support_width + beamWidth/2 - rollRadius*2);
  ctx.lineTo(loc_org_x - support_width/2 + rollRadius,o.ycoord+support_width + beamWidth/2 - rollRadius*2);
  //ctx.lineTo(o.xcoord,o.ycoord+(beamWidth/2));
  //ctx.stroke();  
  ctx.fill();
  ctx.closePath();

  //left cylinder
	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.fillStyle="#000";
	ctx.arc(loc_org_x - support_width/2 + 2*rollRadius
		, o.ycoord+support_width + beamWidth/2 - rollRadius, rollRadius, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.fill();
	ctx.closePath();	

  //right cylinder 
  ctx.beginPath();
	ctx.fillStyle="#000";
	ctx.lineWidth = 1;
	ctx.arc(loc_org_x + support_width/2 - 2*rollRadius
		, o.ycoord+support_width + beamWidth/2 - rollRadius, rollRadius, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.fill();
	ctx.closePath();

  //original beam postion
  ctx.beginPath();
  ctx.globalAlpha=0.1;
  ctx.lineWidth=beamWidth;
  ctx.strokeStyle= "#000";
  ctx.moveTo(x_offset + support_offset ,o.ycoord);
  ctx.lineTo(beamLength+x_offset  ,o.ycoord);
  ctx.stroke();
  ctx.globalAlpha=1; 
  ctx.closePath();  

  //ground
  ctx.beginPath();
  ctx.globalAlpha=0.3;
  ctx.lineWidth=groundWidth;
  ctx.strokeStyle= "#000";
  ctx.moveTo(x_offset - groundOffset,o.ycoord + beamWidth/2 + support_width + groundWidth /2);
  ctx.lineTo(beamLength+x_offset+groundOffset  ,o.ycoord + beamWidth/2 + support_width + groundWidth/2);
  ctx.stroke();
  ctx.globalAlpha=1; 
  ctx.closePath();  

  //draw force arrow
  support_width = 20;
  drawForceArrow(ctx);

  //draw SFD
  drawSfdforSimplySupported(ctx, load, load_point);

  //draw BMD
  drawBmdforSimplySupported(ctx, load, load_point);

  
  e /= 100;
  i /= 100; 
}

function calculatDeflectionForSimplySupported(load_point, load, x, wedgePosition){

  if(load_point <= wedgePosition){
    if(x <= load_point)
      return (load * (wedgePosition- load_point ) * x) * ( pow(wedgePosition, 2) - pow( wedgePosition-load_point, 2) -  pow(x,2) ) / (6 * wedgePosition * e*i );
    else if( x > load_point && x < wedgePosition)
      return (load * load_point * (wedgePosition- x ) ) * ( 2*wedgePosition*x - pow( load_point, 2) -  pow(x,2) ) / (6 * wedgePosition * e*i);
    else
      return  - (load * load_point * (wedgePosition - load_point) * (x - wedgePosition ) * ( (wedgePosition - o.xcoord) + load_point)) / (6 * e * i * wedgePosition ); 
  }
  else if(load_point > wedgePosition){
    if(x <= wedgePosition){
      return -(load * (load_point - wedgePosition) * x * (pow(wedgePosition, 2) -  pow(x,2) )) / (6* e* i* wedgePosition);
    }
    else{
      return load*(x-wedgePosition)*(2*(load_point - wedgePosition)*wedgePosition + 3*(load_point - wedgePosition)*(x-wedgePosition) - pow(x-wedgePosition, 2)) / (6*e*i);
    }
  }
}


function drawSfdforSimplySupported(ctx, load, load_point){

  //left support lines

  
  pointtrans(o, new point(0,300));

  ctx.lineWidth=1;
    ctx.strokeStyle= "#616161";


  ctx.beginPath();
  ctx.moveTo(o.xcoord + support_width/2 , o.ycoord - support_length/2);
  ctx.lineTo(o.xcoord + support_width/2, o.ycoord + support_length/2);
  ctx.stroke();
  ctx.closePath();

  

  ctx.beginPath();
  ctx.moveTo(o.xcoord + support_width/2 + beamLength, o.ycoord - support_length/2);
  ctx.lineTo(o.xcoord + support_width/2 + beamLength, o.ycoord + support_length/2);
  ctx.stroke();
  ctx.closePath();


  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.moveTo(o.xcoord + support_width/2 , o.ycoord );
  ctx.lineTo(o.xcoord + support_width/2 + beamLength , o.ycoord );
  ctx.stroke();
  ctx.closePath();

  ctx.save();
  ctx.lineWidth=1;
  ctx.strokeStyle="#000000";
  ctx.fillStyle = "#000"
  ctx.font = "12px Arial";
  ctx.strokeText('SFD (N)', o.xcoord + support_width/2 , o.ycoord - support_length/2 - 10);  
  ctx.restore();


  if(load_point <= wedgePosition){
    var Ra = calculateReactionSimplySupported(load, beamLength - load_point, beamLength);
    var Rb = calculateReactionSimplySupported(load, load_point, beamLength);

    ctx.save();
    ctx.lineWidth=1;
    ctx.strokeStyle="#000000";
    ctx.font = "10px Arial";
    ctx.strokeText('' + Math.ceil(Ra), o.xcoord + support_width/2 - 20, o.ycoord - support_length/2 + 15);  
    ctx.strokeText('' + Math.floor(Rb), o.xcoord + support_width/2 + beamLength + 10, o.ycoord  + 15)
    ctx.restore();

    if(Ra > support_length/2)
      Ra = support_length/2;

    if(Rb > support_length/2)
      Rb = support_length/2;

    if( Ra != 0 && Rb != 0){
      ctx.beginPath();
      ctx.lineWidth = Ra;
      ctx.moveTo(o.xcoord + support_width/2 , o.ycoord - Ra/2);
      ctx.lineTo(o.xcoord + support_width/2 + load_point , o.ycoord - Ra/2);
      ctx.stroke();
      ctx.closePath();


      
      ctx.beginPath();
      ctx.lineWidth = Rb;
      ctx.moveTo(o.xcoord + support_width/2 +load_point, o.ycoord + Rb/2);
      ctx.lineTo(o.xcoord + support_width/2 + wedgePosition , o.ycoord + Rb/2);
      ctx.stroke();
      ctx.closePath();
    }


  }
  else{
    var Ra = calculateReactionSimplySupported(load, load_point, beamLength);
    var Rb = calculateReactionSimplySupported(load, load_point + beamLength, beamLength);

    ctx.save();
    ctx.lineWidth=1;
    ctx.strokeStyle="#000000";
    ctx.font = "10px Arial";
    ctx.strokeText('' + Math.ceil(Ra), o.xcoord + support_width/2 - 20, o.ycoord - support_length/2 + 15);  
    ctx.strokeText('' + Math.floor(Rb), o.xcoord + support_width/2 + beamLength + 10, o.ycoord  + 15)
    ctx.restore();

    if(Ra > support_length/2)
      Ra = support_length/2;

    if(Rb > support_length/2)
      Rb = support_length/2;

    if( Ra != 0 && Rb != 0){

      ctx.beginPath();
      ctx.lineWidth = Ra;
      ctx.moveTo(o.xcoord + support_width/2 , o.ycoord - Ra/2);
      ctx.lineTo(o.xcoord + support_width/2 + wedgePosition , o.ycoord - Ra/2);
      ctx.stroke();
      ctx.closePath();


      
      ctx.beginPath();
      ctx.lineWidth = Rb;
      ctx.moveTo(o.xcoord + support_width/2 +wedgePosition, o.ycoord + Rb/2);
      ctx.lineTo(o.xcoord + support_width/2 + load_point , o.ycoord + Rb/2);
      ctx.stroke();
      ctx.closePath();
    }

  }


  

  

  
  

  pointtrans(o, new point(0,300));

}

function calculateReactionSimplySupported(P, value, l){
  return (P * value / l);
}


function drawBmdforSimplySupported(ctx, load, load_point){
  pointtrans(o, new point(0,400));

  ctx.lineWidth=1;
    ctx.strokeStyle= "#616161";


  ctx.beginPath();
  ctx.moveTo(o.xcoord + support_width/2 , o.ycoord - support_length/2);
  ctx.lineTo(o.xcoord + support_width/2, o.ycoord + support_length/2);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(o.xcoord + support_width/2 + beamLength, o.ycoord - support_length/2);
  ctx.lineTo(o.xcoord + support_width/2 + beamLength, o.ycoord + support_length/2);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.moveTo(o.xcoord + support_width/2 , o.ycoord );
  ctx.lineTo(o.xcoord + support_width/2 + beamLength , o.ycoord );
  ctx.stroke();
  ctx.closePath();

  ctx.save();
  ctx.lineWidth=1;
  ctx.strokeStyle="#000000";
  ctx.fillStyle = "#000"
  ctx.font = "12px Arial";
  ctx.strokeText('BMD (N-m)', o.xcoord + support_width/2 , o.ycoord - support_length/2 - 15);  
  ctx.restore();



  var untill = beamLength;

  if( load_point <= wedgePosition)
    untill = wedgePosition;
  else
    untill = load_point;

  ctx.beginPath();
  ctx.moveTo(o.xcoord + support_width/2, o.ycoord );
  for(var i = 0; i < untill; i++){
    ctx.lineTo(o.xcoord + support_width/2 + i, o.ycoord - calculateBmdforSimplySupported(load, load_point, i, wedgePosition))
    ctx.moveTo(o.xcoord + support_width/2 + i +1, o.ycoord );
    ctx.stroke();
  }

  ctx.closePath();

  
  var offset = 20;
  if(load_point < wedgePosition){
    offset = 0;
  }
  ctx.save();
  ctx.lineWidth=1;
  ctx.strokeStyle="#000000";
  ctx.font = "10px Arial";
  ctx.strokeText('' + Math.ceil(calculateBmdforSimplySupported(load, load_point, load_point, beamLength)), o.xcoord + support_width/2 - 20, o.ycoord  - 5 + offset);  
  // ctx.strokeText('' + calculateBmdforSimplySupported(load, load_point, 0, beamLength), o.xcoord + support_width/2 + beamLength + 10, o.ycoord  + 15)
  ctx.restore();
}

function calculateBmdforSimplySupported(P, a, x, l){
  if(a <= l){
     if( x <= a ){
        // var r = calculateReactionFixed(P, a, l - a, l);
        return (P*(l-a)*x)/ (l*1000);
      }
      else{
        return (P*a)*(l-x)/ (l*1000);
      }
  }
  else{
    if( x <= l){
      return -(P*(a - l )*x) / (l * 1000);
    }
    else{
      return -P*(a - x)/1000;
    }
  }
}


function pow(num, power){
	if(power == 1)
		return num;
	else
		return num*pow(num, power-1);
	
}


/*
-------  GENERAL  ------------------------------------------------------- 
*/


function drawForceArrow(context){
  //context.save();
  force_pos_x = $('#aspinner').spinner("value") + x_offset +support_width/2 ;
  
  var deflection;
  if(scene == FIXED_BEAM)
     deflection = calculatDeflectionForFixed(load_point, load, load_point);
  else if(scene == CANTILEVER_BEAM)
    deflection = calculatDeflectionForCantilever(load_point, load, load_point);
  else if(scene == SIMPLY_SUPPORTED)
    deflection = calculatDeflectionForSimplySupported(load_point, load, load_point, wedgePosition);

  var arrow_bottom_tip_y = y_offset + deflection - beamWidth/2;
  var arrow_head_length = 30;
  var arrow_line_length = 50;
  var arrow_line_width = 5;

  context.beginPath();
  context.lineWidth=arrow_line_width;
  context.strokeStyle="#211b13";
  context.moveTo(force_pos_x,arrow_bottom_tip_y - arrow_head_length);
  context.lineTo(force_pos_x,arrow_bottom_tip_y - arrow_head_length-arrow_line_length);
  context.stroke();
  context.closePath();

  context.beginPath();
  context.lineWidth=arrow_line_width;
  context.strokeStyle="#211b13";
  context.moveTo(x_offset+support_width/2,40);
  context.lineWidth=3;
  context.strokeStyle="#BBBBBB";
  context.lineTo(force_pos_x,40);
  context.moveTo(x_offset+support_width/2,40+5);
  context.lineTo(x_offset+support_width/2,40-5);
  context.moveTo(force_pos_x,40+5);
  context.lineTo(force_pos_x,40-5);
  context.stroke();
  context.closePath();

  context.save();
   context.lineWidth=1;
   context.font="15px 'Arial'";
   context.strokeStyle="#000000";
   context.strokeText('a',((x_offset+support_width/2)+force_pos_x)/2,35);
   context.restore();

   context.beginPath();
  context.lineWidth=arrow_line_width;
  context.strokeStyle="#211b13";
  context.moveTo(x_offset+support_width/2,395);
  context.lineWidth=3;
  context.strokeStyle="#BBBBBB";
  context.lineTo(x_offset+support_width/2+400,395);
  context.moveTo(x_offset+support_width/2,395+5);
  context.lineTo(x_offset+support_width/2,395-5);
  context.moveTo(x_offset+support_width/2+400,395+5);
  context.lineTo(x_offset+support_width/2+400,395-5);
  context.stroke();
  context.closePath();

  context.save();
   context.lineWidth=1;
   context.font="12px 'Arial'";
   context.strokeStyle="#000000";
   context.strokeText('L=400mm',(x_offset+support_width/2+200),385);
   context.restore();


  
  drawArrow(force_pos_x,arrow_bottom_tip_y,ctx,270,arrow_head_length,30,'#211b13','',"#211b13");

  
 // function drawrem(context)
}

function changeScene(value){
  scene = value;
  if(value == FIXED_BEAM)
    document.getElementById('simtitle').innerHTML = "Fixed Beam";
  else if(value == CANTILEVER_BEAM)
    document.getElementById('simtitle').innerHTML = 'Cantilever Beam';
  else
    document.getElementById('simtitle').innerHTML = 'Simply Supported Beam';
}

function changeSceneNext(){
	if(scene == SIMPLY_SUPPORTED)
		scene = FIXED_BEAM;
	else
		scene++;
	changeScene(scene);
}

function changeScenePrev(){
	if(scene == FIXED_BEAM)
		scene = SIMPLY_SUPPORTED;
	else
		scene--;
	changeScene(scene);
}

function drawrem(context)
{ 

// positioning dimension display  
   offset = 0;

// dimension line      
  context.save();
  context.moveTo(x_offset,60-offset);
  context.lineWidth=3;
  context.strokeStyle="#000000";
  context.lineTo(force_pos_x,60-offset);
  context.moveTo(x_offset+support_width/2,60-offset+5);
  context.lineTo(x_offset+support_width/2,60-offset-5);
  context.moveTo(force_pos_x,60-offset+5);
  context.lineTo(force_pos_x,60-offset-5);
  context.stroke();
  
// arrows at dimension
  drawArrow(force_pos_x,60,context,180,15,30,'#000','',"#000");
  drawArrow(x_offset+support_width/2,60,context,0,15,30,'#000','',"#000");

}

// prints comments passed as 'commenttext' in location specified by 'commentloc' in the comments box;
// 0 : Single comment box, 1 : Left comment box, 2 : Right comment box
function printcomment(commenttext,commentloc)
{
  if(commentloc==0)
  {
  document.getElementById('commentboxright').style.visibility='hidden';
  document.getElementById('commentboxleft').style.width='0px';
  document.getElementById('commentboxleft').innerHTML = commenttext;
  }
  else if(commentloc==1)
  {
  document.getElementById('commentboxright').style.visibility='visible';
  document.getElementById('commentboxleft').style.width='285px';
  document.getElementById('commentboxleft').innerHTML = commenttext;
  }
  else if(commentloc==2)
  {
  document.getElementById('commentboxright').style.visibility='visible';
  document.getElementById('commentboxleft').style.width='285px';
  document.getElementById('commentboxright').innerHTML = commenttext;
  }
  else
  {
  document.getElementById('commentboxright').style.visibility='hidden';
  document.getElementById('commentboxleft').style.width='570px';
  document.getElementById('commentboxleft').innerHTML = "<center>please report this issue to adityaraman@gmail.com</center>"; 
  // ignore use of deprecated tag <center> . Code is executed only if printcomment function receives inappropriate commentloc value
  }
}
