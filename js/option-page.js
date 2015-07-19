$(function() {
  $('#changeBank').change(function() {
    var val = $(this).val();
    
    chrome.storage.local.set({'bankID': val});
  });

  chrome.storage.local.get(['bankID'], function(e) {
  	if (e.bankID) {
  		$('#changeBank').val(e.bankID);
  	}
  });
});