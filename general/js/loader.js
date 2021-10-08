function startLoad(msg) {
  if (msg == undefined) {
    msg = '処理中です';
  }
  var dispMsg = "<div class='loadingMsg'><p>" + msg + "</p></div>";
  if ($("#loading").length == 0) {
    $("body").append("<div id='loading'>" + dispMsg + "</div>");
  }
}

function startLoad2(msgType){
  var logingFrame=document.createElement('div');
  var dispMsg=document.createElement('div');
  dispMsg.classList.add('loadingMsg');
  switch(msgType){
    default:
      var textLine1=document.createElement('p');
      textLine1.innerText='処理中';
      dispMsg.appendChild(textLine1);
  }
  logingFrame.appendChild(dispMsg);
  if ($("#loading").length == 0) {
    $("body").appendChild(logingFrame);
  }
}

function endLoad(){
  $("#loading").remove();
}