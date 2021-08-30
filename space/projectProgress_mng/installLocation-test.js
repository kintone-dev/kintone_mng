/*

// ヘッダー取得
function getHeader() {
	return $.ajax({ type: ‘HEAD’, cache: false });
} 

//Auto Numbering 自動採番
function bNum(header_){
	var autoNumbering = 0;
	getHeader().done( function(data, status, xhr) {
		var serverTime = new Date(xhr.getResponseHeader('Date')).getTime();
		return header_ + Math.floor(serverTime/5000);
	}).fail( function(error){
	  var clientTime = new Date().getTIme();
		return header_ + Math.floor(0);
	});
}

(function() {
  'use strict';
  kintone.events.on('app.record.create.show', function(event) {
    
    var request = new XMLHttpRequest();
request.open('HEAD', window.location.href, true);
request.send();
request.onreadystatechange = function() {
  //if (this.readyState === 4) {
  var serverDate=new Date(request.getResponseHeader('Date')).getTime();
  console.log('getTime: '+serverDate);
  var serverDateStr=serverDate.toString();
  console.log('dateStr: '+serverDateStr);
  return serverDateStr ;
  //}
  
};
console.log('dateOutside: '+request.onreadystatechange());

  });
})();

*/
