"use strict";

var dataParser = dataParser || {};
var dataRequest;

dataParser['reset'] = function() {
  if (dataRequest) {
    dataRequest.abort();
  }    
};

// 004 台灣銀行
dataParser['004'] = function(fn) {
  dataRequest = $.get('http://rate.bot.com.tw/xrt?Lang=zh-TW', function(htmlStr) {
    htmlStr = htmlStr.replace(/<img[^>]*>/ig, '');

    var dom = $(htmlStr);
    var datetime = $.trim(dom.find('.container .text-info > .time').text());
    var dataTable = dom.find('table tr');
    var res = {};

    res.datetime = datetime;
    res.cashRate = [];
    res.spotRate = [];

    dataTable.each(function() {
      var tds = $(this).find('td');
      var tmpObj;

      if (tds.length == 0) return;

      var rateTitle = $.trim(tds.eq(0).find('.hidden-phone').text());
      
      tmpObj = {
        title:    rateTitle,
        priceIN:  $.trim(tds.eq(1).text()),
        priceOUT: $.trim(tds.eq(2).text())
      };
      if (tmpObj.title.length > 0 && tmpObj.priceIN != '-') {
        res.cashRate.push(tmpObj);
      }

      tmpObj = {
        title:    rateTitle,
        priceIN:  $.trim(tds.eq(3).text()),
        priceOUT: $.trim(tds.eq(4).text())
      };
      if (tmpObj.title.length > 0 && tmpObj.priceIN != '-') {
        res.spotRate.push(tmpObj);
      }
    });

    fn.apply(this, [res]);
  });
};

// 005 土地銀行
dataParser['005'] = function(fn) {
  dataRequest = $.get('https://ebank.landbank.com.tw/infor/infor.aspx?__eventtarget=querycurrency', function(htmlStr) {
    htmlStr = htmlStr.replace(/<img[^>]*>/ig, '');

    var dom = $(htmlStr);
    var datetime = dom.find('#TbDateTime').text().substring(6, 24);
    var dataTable = dom.find('#Display > tbody > tr');
    var res = {};

    res.datetime = datetime.replace(/[年月]/g, '/').replace('日', '');
    res.cashRate = [];
    res.spotRate = [];

    dataTable.each(function() {
      var tds = $(this).find('td');
      var tmpObj;

      if (tds.eq(3).hasClass('disptabHeader')) return;

      tmpObj = {
        title:    $.trim(tds.eq(0).text()),
        priceIN:  $.trim(tds.eq(1).text()),
        priceOUT: $.trim(tds.eq(2).text())
      };
      if (tmpObj.title.length > 0 && tmpObj.priceIN != '--') {
        res.spotRate.push(tmpObj);
      }

      tmpObj = {
        title:    $.trim(tds.eq(0).text()),
        priceIN:  $.trim(tds.eq(3).text()),
        priceOUT: $.trim(tds.eq(4).text())
      };
      if (tmpObj.title.length > 0 && tmpObj.priceIN != '--') {
        res.cashRate.push(tmpObj);
      }
    });

    fn.apply(this, [res]);
  });
};

// 006 合庫商銀
dataParser['006'] = function(fn) {
  dataRequest = $.get('http://www.tcb-bank.com.tw/finance_info/Pages/foreign_spot_rate.aspx', function(htmlStr) {
    htmlStr = htmlStr.replace(/<img[^>]*>/ig, '');

    var dom = $(htmlStr);
    var dtStr = dom.find('#ctl00_PlaceHolderEmptyMain_PlaceHolderMain_fecurrentid_lblDate').text();
    var date = dtStr.substring(5, 14);
    var year = date.split('/')[0];
    date = date.replace(year, (year-0)+1911);
    var time = dtStr.substring(20, 25);
    var dataTable = dom.find('#ctl00_PlaceHolderEmptyMain_PlaceHolderMain_fecurrentid_gvResult > tbody > tr');
    var res = {};
    var ti, p1, p2;

    res.datetime = date +' '+ time;
    res.cashRate = [];
    res.spotRate = [];

    dataTable.each(function() {
      if ($(this).hasClass('content-title-line')) return;

      var tds = $(this).find('td');
      var tmpObj;

      if ($(this).hasClass('content-line')) {
        ti = tds.eq(0).text();
        p1 = tds.eq(2).text();
        p2 = tds.eq(3).text();
      }

      if ($(this).hasClass('content-bk-line')) {
        tmpObj = {
          title:    ti,
          priceIN:  p1,
          priceOUT: $.trim(tds.eq(2).text())
        };
        if (tmpObj.title.length > 0 && tmpObj.priceIN != '\xA0') {
          res.spotRate.push(tmpObj);
        }

        tmpObj = {
          title:    ti,
          priceIN:  p2,
          priceOUT: $.trim(tds.eq(3).text())
        };

        if (tmpObj.title.length > 0 && tmpObj.priceIN != '\xA0') {
          res.cashRate.push(tmpObj);
        }
      }
    });

    fn.apply(this, [res]);
  });
};

// 007 第一銀行
dataParser['007'] = function(fn) {
  dataRequest = $.get('https://ibank.firstbank.com.tw/NetBank/7/0201.html?sh=none', function(htmlStr) {
    htmlStr = htmlStr.replace(/<img[^>]*>/ig, '');

    var dom = $(htmlStr);
    var datetime = dom.eq(25).text();
    var dataTable = dom.find('#table1 tr');
    var res = {};

    res.datetime = datetime.substring(11, 27);
    res.cashRate = [];
    res.spotRate = [];

    dataTable.each(function() {
      var tds = $(this).find('td');

      if (tds.length == 0) return;

      var tmpObj = {
        title: $.trim(tds.eq(0).text()).split('(')[0].replace('  ', ''),
        priceIN:    $.trim(tds.eq(2).text()),
        priceOUT:   $.trim(tds.eq(3).text())
      };

      var type = tds.eq(1).text();
      if (type == '即期' && tmpObj.title.length > 0) {
        res.spotRate.push(tmpObj);
      } else if (type == '現鈔' && tmpObj.title.length > 0) {
        res.cashRate.push(tmpObj);
      }
    });

    fn.apply(this, [res]);
  });
};

// 008 華南銀行
dataParser['008'] = function(fn) {
  dataRequest = $.get('https://ibank.hncb.com.tw/netbank/pages/jsp/ExtSel/RTExange.html', function(htmlStr) {
    htmlStr = htmlStr.replace(/<img[^>]*>/ig, '');

    var dom = $(htmlStr);
    var datetime = $.trim(dom.find('table .formtable_subject15rb:eq(2)').text());
    var dataTable = dom.find('table:eq(3) tr');
    var res = {};

    res.datetime = datetime.substring(7, 24);
    res.cashRate = [];
    res.spotRate = [];

    dataTable.each(function() {
      var tds = $(this).find('td');

      if ($(tds[0]).hasClass('formtable_infotitle13rd')) return;

      var tmpObj = {
        title:      $.trim(tds.eq(0).text()),
        priceIN:    $.trim(tds.eq(1).text()),
        priceOUT:   $.trim(tds.eq(2).text())
      };

      var type = tds.eq(0).text();
      if ((type.indexOf('現鈔') >= 0)  && tmpObj.title.length > 0) {
        res.cashRate.push(tmpObj);
      } else {
        res.spotRate.push(tmpObj);
      }
    });

    fn.apply(this, [res]);
  });
};

// 009 彰化銀行
dataParser['009'] = function(fn) {
  dataRequest = $.get('https://www.chb.com.tw/chbib/faces/po/po01009/PO01009_1.jsp', function(htmlStr) {
    htmlStr = htmlStr.replace(/<img[^>]*>/ig, '');

    var dom = $(htmlStr);
    var datetime = $.trim(dom.find('table .contentNote:eq(1)').text());
    var year = datetime.substring(7, 10);
    var date = datetime.substring(11, 22);
    var dataTable = dom.find('#form1 > table.tableColorWhite tr');
    var res = {};

    res.datetime = (year-0)+1911 + '/' + date;
    res.cashRate = [];
    res.spotRate = [];

    dataTable.each(function() {
      var tds = $(this).find('td');

      if ($(tds[1]).hasClass('tableColor0') || $(tds[0]).hasClass('tableColorYellow')) return;

      var tmpObj = {
        title:      $.trim(tds.eq(0).text()).split('（')[0],
        priceIN:    $.trim(tds.eq(1).text()),
        priceOUT:   $.trim(tds.eq(2).text())
      };

      var type = tds.eq(0).text();
      if ((type.indexOf('現鈔') >= 0)  && tmpObj.title.length > 0) {
        res.cashRate.push(tmpObj);
      } else {
        res.spotRate.push(tmpObj);
      }
    });

    fn.apply(this, [res]);
  });
};

// 011 上海銀行
dataParser['011'] = function(fn) {
  dataRequest = $.get('https://ibank.scsb.com.tw/netbank.portal?_nfpb=true&_pageLabel=page_other12&_nfls=false', function(htmlStr) {
    htmlStr = htmlStr.replace(/<img[^>]*>/ig, '');

    var dom = $(htmlStr);
    var dom = dom.find('table.txt07');
    var datetimeSp = dom.find('tr:eq(1) td').text().substring(7, 28).split(' ');

    var datetime = (datetimeSp[0])-0+1911 + '/' + datetimeSp[3] + '/' + datetimeSp[5] + datetimeSp[6].replace('日', ' ');
    var dataTable = dom.find('tr');
    var res = {};

    res.datetime = datetime;
    res.cashRate = [];
    res.spotRate = [];

    dataTable.each(function() {
      var tds = $(this).find('td');

      if (!$(tds[0]).hasClass('txt09')) return;

      var tmpObj = {
        title:      $.trim(tds.eq(0).text()),
        priceIN:    $.trim(tds.eq(2).text()),
        priceOUT:   $.trim(tds.eq(3).text())
      };

      var type = tds.eq(0).text();
      if ((type.indexOf('現鈔') >= 0 || type.indexOf('現金') >= 0)  && tmpObj.title.length > 0) {
        res.cashRate.push(tmpObj);
      } else {
        res.spotRate.push(tmpObj);
      }
    });

    fn.apply(this, [res]);
  });
};

// 013 國泰世華
dataParser['013'] = function(fn) {
  dataRequest = $.get('https://www.cathaybk.com.tw/cathaybk/mobile/rate_01.asp', function(htmlStr) {
    htmlStr = htmlStr.replace(/<img[^>]*>/ig, '');

    var dom = $(htmlStr);
    var datetime = dom.find('section:eq(0)').text().substring(17, 33);
    var dataTable = dom.find('section.rate_list dd');
    var res = {};

    res.datetime = datetime.replace('年', '/').replace('月', '/').replace('日', ' ').replace('時', ':');
    res.cashRate = [];
    res.spotRate = [];

    dataTable.each(function() {
      var tds = $(this).find('div');

      var tmpObj = {
        title:      $.trim(tds.eq(0).text()).split('(')[0],
        priceIN:    $.trim(tds.eq(2).text()),
        priceOUT:   $.trim(tds.eq(4).text())
      };

      var type = tds.eq(0).text();
      if (type.indexOf('現鈔') >= 0  && tmpObj.title.length > 0) {
        res.cashRate.push(tmpObj);
      } else {
        res.spotRate.push(tmpObj);
      }
    });

    fn.apply(this, [res]);
  });
};

// 017 兆豐商銀
dataParser['017'] = function(fn) {
  var ran_number = Math.random() * 4;
  dataRequest = $.get('https://wwwfile.megabank.com.tw/rates/D001/_@V_.asp?random=' + ran_number, function(data) {
    var separate = data.split('|');
    var dateTime = separate[0] + ' ' + separate[1];
    var exData = separate[2].split('__header_=0;');
    var len = exData.length;
    var res = {};
    var tmpObj;

    res.datetime = dateTime;
    res.cashRate = [];
    res.spotRate = [];

    for (var i = 0; i < len; i++) {
      if (exData[i] == '') continue;

      var row = exData[i].split(';');
      var priceObj = [];

      for (var j = 0; j < row.length; j++) {
        var col = row[j].split('=');
        switch (col[0]) {
          case 'col0': priceObj['title'] = col[1].split('[')[0]; break;
          case 'col1': priceObj['spotPriceIN'] = col[1]; break;
          case 'col2': priceObj['cashPriceIN'] = col[1]; break;
          case 'col3': priceObj['spotPriceOUT'] = col[1]; break;
          case 'col4': priceObj['cashPriceOUT'] = col[1]; break;
        }
      }

      if (priceObj.spotPriceIN != '---') {
        tmpObj = {
          title:    priceObj.title,
          priceIN:  priceObj.spotPriceIN,
          priceOUT: priceObj.spotPriceOUT
        };
        res.spotRate.push(tmpObj);
      }

      if (priceObj.cashPriceIN != '---') {
        tmpObj = {
          title:    priceObj.title,
          priceIN:  priceObj.cashPriceIN,
          priceOUT: priceObj.cashPriceOUT
        };
        res.cashRate.push(tmpObj);
      }
    }
    
    fn.apply(this, [res]);
  });
};

// 807 永豐銀行
dataParser['807'] = function(fn) {
  dataRequest = $.get('https://mma.sinopac.com/WebATM/html/pages/jsp/mma/bank/CurrRemittance.jsp?src=EBANK', function(htmlStr) {
    htmlStr = htmlStr.replace(/<img[^>]*>/ig, '');

    var dom = $(htmlStr);
    var datetime = dom.find('tbody:first > tr:nth-child(3) > td').text();
    var dataTable = dom.find('table.mt tr');
    var res = {};

    res.datetime = datetime.substring(6, 22).replace(/-/g, '/');
    res.cashRate = [];
    res.spotRate = [];

    dataTable.each(function() {
      if ($(this).attr('align')) return;

      var tds = $(this).find('td');
      var tmpObj;

      tmpObj = {
        title: $.trim(tds.eq(0).text()).split('(')[0],
        priceIN:    $.trim(tds.eq(1).text()),
        priceOUT:   $.trim(tds.eq(2).text())
      };
      if (tmpObj.title.length > 0) {
        res.spotRate.push(tmpObj);
      }

      tmpObj = {
        title: $.trim(tds.eq(0).text()).split('(')[0],
        priceIN:    $.trim(tds.eq(3).text()),
        priceOUT:   $.trim(tds.eq(4).text())
      };
      if (tmpObj.priceIN.length > 0 && tmpObj.priceOUT.length > 0) {
        res.cashRate.push(tmpObj);
      }
    });

    fn.apply(this, [res]);
  });
};

// 808 玉山銀行
dataParser['808'] = function(fn) {
  var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://www.esunbank.com.tw/bank/Layouts/esunbank/Deposit/DpService.aspx/GetForeignExchageRate",
  "method": "POST",
  "headers": {
    "content-type": "application/json; charset=UTF-8",
    "referer": "https://www.esunbank.com.tw/bank/personal/deposit/rate/forex/foreign-exchange-rates",
    "cache-control": "no-cache",
    "postman-token": "aa09c485-52e7-5f69-4edb-9a7cb3c5a131"
  },
  "data": "{day:'2016-10-06',time:'18:28:40'}"
}

$.ajax(settings).done(function (response) {
  console.log(response);
});

	dataRequest = $.post('https://www.esunbank.com.tw/bank/Layouts/esunbank/Deposit/DpService.aspx/GetForeignExchageRates',
    postBody,
   function(htmlStr) {
    htmlStr = htmlStr.replace(/<img[^>]*>/ig, '');

    var dom = $(htmlStr);
    var date = dom.find('#Uc_rate_spot_exchange_ListWorkDays option:selected').text();
    var time = dom.find('#Uc_rate_spot_exchange_ListDateTime option:selected').text();
    var dataTable = dom.find('.datatable .tableContent-light');
    var res = {};

    res.datetime = date + time.substr(0, 6);
    res.cashRate = [];
    res.spotRate = [];

    dataTable.each(function() {
      var tds = $(this).find('td');
      var tmpObj;

      tmpObj = {
        title: $.trim(tds.eq(0).text()),
        priceIN:    $.trim(tds.eq(1).text()),
        priceOUT:   $.trim(tds.eq(2).text())
      };
      if (tmpObj.title.length > 0) {
        res.cashRate.push(tmpObj);
      }

      tmpObj = {
        title: $.trim(tds.eq(3).text()),
        priceIN:    $.trim(tds.eq(4).text()),
        priceOUT:   $.trim(tds.eq(5).text())
      };
      if (tmpObj.title.length > 0) {
        res.spotRate.push(tmpObj);
      }
    });

    fn.apply(this, [res]);
  });
};