const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var audio = document.getElementById("myAudio");

// heading note
ctx.fillStyle = "black"
ctx.font = "20px bold Arial";
let text = "Note:"
ctx.fillText(text,10,490);
ctx.fillStyle = "black";
ctx.font = "18px Arial";
text = "Resistance of Ammeter is assumed as 0"
ctx.fillText(text,60,491);

//Initialise system parameters here
function varinit() {
  varchange();
  //Variable slider and number input types
  $("#voltageSlider").slider("value", 0.05); // slider initialisation : jQuery widget
  $("#voltageSpinner").spinner("value", 0.05); // number initialisation : jQuery widget
  $("#resistorSlider").slider("value", 0.01);
  $("#resistorSpinner").spinner("value", 0.01);
  $("#thresholdSlider").slider("value", 0.05);
  $("#thresholdSpinner").spinner("value", 0.05);
  $("#CsArea").spinner("value", 0.01);
  $("#Ivalue").spinner("value", 0.01);

  $('#voltageSlider').slider("disable"); 
  $('#voltageSpinner').spinner("disable");
  $('#resistorSlider').slider("disable"); 
  $('#thresholdSlider').slider("disable"); 
  $('#resistorSpinner').spinner("disable"); 
  $('#thresholdSpinner').spinner("disable"); 
  $("#threshold-btn, #simulate-btn").prop("disabled", true);
  text = "Step 1: Complete the circuit connection"
  displayInstruction(text);
  $("#message").text("Complete the circuit connection");
  $("#voltage, #resistance, #current, #threshold").text(0);
  clearLive()
  clearNeutral()
}
function displayInstruction(text) {
  ctx.fillStyle = "white";
  ctx.fillRect(10,1,550,20)
  ctx.fillStyle = "black"
  ctx.font = "18px Arial";
  ctx.fillText(text,10,19);
}

function varchange() {
  $("#voltageSlider").slider({ max: 300, min: 0, step: 10 });
  $("#voltageSpinner").spinner({ max: 300, min: 0, step: 10 });

  $("#voltageSlider").on("slide", function (e, ui) {
    $("#voltageSpinner").spinner("value", ui.value);
    time = 0;
    varupdate();
  });
  $("#voltageSpinner").on("spin", function (e, ui) {
    $("#voltageSlider").slider("value", ui.value);
    time = 0;
    varupdate();
  });
  $("#voltageSpinner").on("change", function () {
    varchange();
  });

  $("#resistorSlider").slider({ max: 200, min: 0, step: 1 });
  $("#resistorSpinner").spinner({ max: 200, min: 0, step: 1 });

  $("#resistorSlider").on("slide", function (e, ui) {
    $("#resistorSpinner").spinner("value", ui.value);
    time = 0;
    varupdate();
  });
  $("#resistorSpinner").on("spin", function (e, ui) {
    $("#resistorSlider").slider("value", ui.value);
    time = 0;
    varupdate();
  });
  $("#resistorSpinner").on("change", function () {
    varchange();
  });
  $("#resistorSpinner").on("touch-start", function () {
    varchange();
  });

 $("#thresholdSlider").slider({ max: 50, min: 0, step: 0.5 });
  $("#thresholdSpinner").spinner({ max: 50, min: 0, step: 0.5 });

  $("#thresholdSlider").on("slide", function (e, ui) {
    $("#thresholdSpinner").spinner("value", ui.value);
    time = 0;
    varupdate();
  });
  $("#thresholdSpinner").on("spin", function (e, ui) {
    $("#thresholdSlider").slider("value", ui.value);
    time = 0;
    varupdate();
  });
  $("#thresholdSpinner").on("change", function () {
    varchange();
  });
  $("#CsArea").spinner({ max: 1, min: 0.01, step: 0.0001 });
  $("#Ivalue").spinner({ max: 1, min: 0.01, step: 0.0001 });
}

function varupdate() {
  $("#voltageSpinner").spinner("value", $("#voltageSlider").slider("value")); //updating slider location with change in spinner(debug)
  $("#resistorSpinner").spinner("value", $("#resistorSlider").slider("value"));
$("#thresholdSpinner").spinner("value", $("#thresholdSlider").slider("value"));
  volt = $("#voltageSpinner").spinner("value"); //Updating variables
  res = $("#resistorSpinner").spinner("value");
  thres = $("#thresholdSpinner").spinner("value");
  
  if (res === 0){
    fuse();
    pauseAudio()
   
    $('#current').text(0);
    $('#resultMessage').text("");
  }else{
    if ((volt/res)>=thres) {
      playAudio();
      fusebreak();
      blackWire();
      // alert("Fuse is broken as the threshold current is exceeded")
      $('#current').text(0);
      $('#resultMessage').text("The fuse breaks as the maximum allowable current is exceeded");
    }
    else{
      fuse();
      pauseAudio()
      $('#current').text((volt / res).toFixed(4));
      $('#resultMessage').text("");
    }
  }
  $('#voltage').text(volt);
  $('#resistance').text(res);
  $('#threshold').text(thres);
  fuseThresholdDisplay(thres);
  resistanceDisplay(res);
  if (((volt === 0)&&(res === 0))|| (res === 0) || (volt === 0) || (volt/res >= thres)) {
    currentThroughAmmeterDisplay(0);    
  } else {
    currentThroughAmmeterDisplay((volt/res))
    greenWire();
  }
  batteryVoltageDisplay(volt);
 };

 function checkConnection() {
  // console.log("working check");
  if(red && black){
    // console.log("working red black");
    alert('Circuit connection is correct ')
    $('#voltageSlider').slider("disable"); 
    $('#voltageSpinner').spinner("disable");
    $('#resistorSlider').slider("disable"); 
    $('#resistorSpinner').spinner("disable"); 
    $('#thresholdSlider').slider("enable"); 
    $('#thresholdSpinner').spinner("enable"); 
    $("#check-btn").prop("disabled", true);
    $("#message").text("Set the threshold current and click on simulate button");
    text = "Step 2: Set the threshold current and click on simulate button"
    displayInstruction(text);
    $("#threshold-btn, #simulate-btn").prop("disabled", false);
    varupdate();
  }
  else{
    if(red == 0 ){
      if(black == 0){
        alert('complete the circuit connection')
        connectLive()
        connectNeutral()
        return;
      }else{
        alert('connect live wire')
        connectLive()
        console.log("live wire");
      }
    }
    if(black == 0){
        alert("connect neutral wire")
        connectNeutral()
        console.log("neutral wire");
      }
    }   
  }


function setThreshold() {
  if(simStat = 1)  {
    // console.log("working");
    $('#voltageSlider').slider("disable"); 
    $('#voltageSpinner').spinner("disable");
    $('#resistorSlider').slider("disable"); 
    $('#resistorSpinner').spinner("disable"); 
    $('#thresholdSlider').slider("enable"); 
    $('#thresholdSpinner').spinner("enable"); 
    $("#message").text("Set the threshold current and click on simulate button");
    }
  }

function parametreSliderEnable() {
    console.log("working");
    $('#voltageSlider').slider("enable"); 
    $('#voltageSpinner').spinner("enable");
    $('#resistorSlider').slider("enable"); 
    $('#resistorSpinner').spinner("enable"); 
    $('#thresholdSlider').slider("disable"); 
    $('#thresholdSpinner').spinner("disable"); 
    $("#message").text("Vary the parameters and see the Result");
    displayInstruction("Step 3:Vary the parameters and see the Result");
}


window.addEventListener("load", varinit);