"use strict";

var data;
var selType = 1;
var myScroll;

//chrome.storage.local.set({'bankID': ''});

function switchType(e) {
  var idStr = e.target.id;

  if (idStr == 'cashBtn') {
    $('#cashBtn').addClass('active');
    $('#spotBtn').removeClass('active');
    
    selType = 2;
    renderTable(2);
  }
  else {
    $('#spotBtn').addClass('active');
    $('#cashBtn').removeClass('active');

    selType = 1;
    renderTable(1);
  }
}

function renderTable(type) {
  var dataHtml = '';
  var source = (type == 1 ? data.spotRate : data.cashRate);

  $('.fxTable.tbBody').hide();

  for (var i = 0, len = source.length; i<len; i++) {
    dataHtml += '<tr>';
    dataHtml += '<td class="col1">'+ source[i].title +'</td>';
    dataHtml += '<td class="col2">'+ source[i].priceIN +'</td>';
    dataHtml += '<td class="col3">'+ source[i].priceOUT +'</td>';
    dataHtml += '</tr>';
  }

  $('.fxTable tbody').html(dataHtml);
  $('.fxTable.tbBody').show();

  setTimeout(function() {
    myScroll.refresh();
  }, 0);
}

function changeBank(bid) {
  showDataLoading();

  var bankID = bid || $('.bankList').val();

  $('.fx-datetime').text('');
  
  dataParser.reset();
  dataParser[bankID](function(res) {
    data = res;
      
    $('.fx-datetime').text(res.datetime);
    renderTable(selType);
  });
}

function showDataLoading() {
  var loading = '<tr><td class="loading-anim">';
  loading += '<img src="images/loading.gif" width="24" height="24" alt="loading">';
  loading += '</td></tr>';

  $('.fxTable tbody').html(loading);
}

// document ready
$(function() {
  chrome.storage.local.get(['bankID'], function(e) {
    if (!e.bankID) {
      var bankID = $('.bankList').val();
      changeBank(bankID);
    }
    else {
      $('.bankList').val(e.bankID);
      changeBank(e.bankID);
    }
  });

  myScroll = new IScroll('.scroller', {
    mouseWheel: true,
    scrollbars: true,
    fadeScrollbars: true
  });

  $('.bankList').change(function() {
    changeBank();
  });
  $('#spotBtn').click(switchType);
  $('#cashBtn').click(switchType);
});