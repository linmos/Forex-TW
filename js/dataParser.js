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
  dataRequest = $.get('https://linmos.azurewebsites.net/api/v1/exchange/4', function(htmlStr) {
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
        ti = $.trim(tds.eq(0).text());
        p1 = $.trim(tds.eq(2).text());
        p2 = $.trim(tds.eq(3).text());
      }

      if ($(this).hasClass('content-bk-line')) {
        tmpObj = {
          title:    ti,
          priceIN:  p1,
          priceOUT: $.trim(tds.eq(2).text())
        };
        if (tmpObj.title.length > 0 && tmpObj.priceIN != '') {
          res.spotRate.push(tmpObj);
        }

        tmpObj = {
          title:    ti,
          priceIN:  p2,
          priceOUT: $.trim(tds.eq(3).text())
        };

        if (tmpObj.title.length > 0 && tmpObj.priceIN != '') {
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
  dataRequest = $.get('https://www.bankchb.com/frontend/G0100.jsp', function(htmlStr) {
    htmlStr = htmlStr.replace(/<img[^>]*>/ig, '');

    var dom = $(htmlStr).find('#content-inside');
    var datetime = $.trim(dom.find('.chb-comp-16').eq(1).text());
    var dataTable = dom.find('table tbody tr');
    var res = {};

    res.datetime = datetime.replace(/\s+/g, ' ').substring(8);
    res.cashRate = [];
    res.spotRate = [];

    dataTable.each(function() {
      var tds = $(this).find('td');
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
    var datetimeSp = dom.find('tr:eq(1) td').text().substring(7).split(' ');

    var datetime = (datetimeSp[0])-0+1911 + '/' + datetimeSp[3] + '/' + datetimeSp[5] + ' ' + datetimeSp[6].substr(-8);
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

// 012 台北富邦銀行
dataParser['012'] = function(fn) {
  dataRequest = $.get('https://ebank.taipeifubon.com.tw/B2C/cfhqu/cfhqu009/CFHQU009_Home.faces', function(htmlStr) {
    htmlStr = htmlStr.replace(/<img[^>]*>/ig, '');

    var dom = $(htmlStr).find('table.tb1');
    var datetime = dom.find('.tb_tit').text().substring(5, 21);
    var dataTable = dom.find('tr');
    var res = {};

    res.datetime = datetime;
    res.cashRate = [];
    res.spotRate = [];

    dataTable.each(function() {
      var tds = $(this).find('td');
      if (tds.eq(0).hasClass('tb_tit') || tds.eq(0).hasClass('hd') || tds.eq(0).hasClass('hd3')) {
        return;
      }

      var title = $.trim(tds.eq(0).text()).split('(')[0];
      if (title.length == 0) return;

      var tmpObj = {
        title:      title,
        priceIN:    $.trim(tds.eq(1).text()),
        priceOUT:   $.trim(tds.eq(2).text())
      };
      res.spotRate.push(tmpObj);

      tmpObj = {
        title:      title,
        priceIN:    $.trim(tds.eq(3).text()),
        priceOUT:   $.trim(tds.eq(4).text())
      };

      if (tmpObj.priceIN != '---' || tmpObj.priceOUT != '---') {
        res.cashRate.push(tmpObj);
      }
    });

    fn.apply(this, [res]);
  });
};

// 013 國泰世華
dataParser['013'] = function(fn) {
  dataRequest = $.get('https://www.cathaybk.com.tw/mobile/personal/rate/exchange/currency-billboard/currency-billboard.aspx', function(htmlStr) {
    htmlStr = htmlStr.replace(/<img[^>]*>/ig, '');

    var dom = $(htmlStr);
    var datetime = dom.find('.functionBar .time').text().substring(5, 21);
    var dataTable = dom.find('#panelRateList .datas table > tbody > tr');
    var res = {};

    res.datetime = datetime.replace('年', '/').replace('月', '/').replace('日', ' ').replace('時', ':');
    res.cashRate = [];
    res.spotRate = [];

    dataTable.each(function() {
      var tds = $(this).find('td');

      var tmpObj = {
        title:      $.trim(tds.eq(0).text()).split('(')[0],
        priceIN:    $.trim(tds.eq(2).text()),
        priceOUT:   $.trim(tds.eq(3).text())
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
  document.cookie="mega%5Fstatus=1123=745d4a21e71174d0; domain=wwwfile.megabank.com.tw; path=/";
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
  dataRequest = $.get('https://mma.sinopac.com/ws/share/rate/ws_exchange.ashx?exchangeType=REMIT', function(data) {
    var datetime = data[0].TitleInfo.substring(25, 44).replace(/-/g, '/');
    var row = data[0].SubInfo
    var res = {};

    res.datetime = datetime
    res.cashRate = [];
    res.spotRate = [];

    for (var i = 0; i < row.length; i++) {
      var tmpObj;

      tmpObj = {
        title: row[i].DataValue1,
        priceIN: row[i].DataValue2,
        priceOUT: row[i].DataValue3
      };
      
      if (tmpObj.priceIN != '-' && tmpObj.priceOUT != '-') {
        res.spotRate.push(tmpObj);
      }
    }

    dataRequest = $.get('https://mma.sinopac.com/ws/share/rate/ws_exchange.ashx?exchangeType=CASH', function(data) {
      row = data[0].SubInfo

      for (var i = 0; i < row.length; i++) {
        var tmpObj;
  
        tmpObj = {
          title: row[i].DataValue1,
          priceIN: row[i].DataValue2,
          priceOUT: row[i].DataValue3
        };
        
        if (tmpObj.priceIN != '-' && tmpObj.priceOUT != '-') {
          res.cashRate.push(tmpObj);
        }
      }

      fn.apply(this, [res]);
    }, 'json');
  }, 'json');
};

// 808 玉山銀行
dataParser['808'] = function(fn) {
  $.get('https://linmos.azurewebsites.net/api/v1/exchange/808', function(data) {
    var rates = data.Rates;
    var res = {};
    res.datetime = rates[0].UpdateTime.replace(/-/g, '/').replace('T', ' ');
    res.cashRate = [];
    res.spotRate = [];

    for (var i = 0; i < rates.length; i++) {
      var rate = rates[i];
      var tmpObj = {
        title:    rate.Title,
        priceIN:  rate.BBoardRate,
        priceOUT: rate.SBoardRate
      };
      if (tmpObj.priceIN != '' || tmpObj.priceOUT != '') {
        res.spotRate.push(tmpObj);
      }

      tmpObj = {
        title:    rate.Title,
        priceIN:  rate.CashBBoardRate,
        priceOUT: rate.CashSBoardRate
      };
      if (tmpObj.priceIN != '' || tmpObj.priceOUT != '') {
        res.cashRate.push(tmpObj);
      }
    }

    fn.apply(this, [res]);
  }, 'json');
};

// 812 台新銀行
dataParser['812'] = function(fn) {
  dataRequest = $.get('https://www.taishinbank.com.tw/TS/TS06/TS0605/TS060502/index.htm?urlPath1=TS02&urlPath2=TS0202', function(htmlStr) {
    htmlStr = htmlStr.replace(/<img[^>]*>/ig, '');

    var dom = $(htmlStr);
    var datetime = dom.find('.box960info table span.content').text().substring(7, 24).replace('  ', ' ');
    var dataTable = dom.find('.box960info table.table01 tr');
    var res = {};

    res.datetime = datetime;
    res.cashRate = [];
    res.spotRate = [];

    dataTable.each(function(i, el) {
      if (i === 0) return;
      var tds = $(this).find('td');

      var tmpObj = {
        title:      $.trim(tds.eq(0).text()),
        priceIN:    tds.eq(1).text(),
        priceOUT:   tds.eq(2).text()
      };
      if (tds.eq(1).text() != '-' && tds.eq(2).text() != '-') {
        res.spotRate.push(tmpObj);
        
      }

      tmpObj = {
        title:      $.trim(tds.eq(0).text()),
        priceIN:    tds.eq(3).text(),
        priceOUT:   tds.eq(4).text()
      };
      if (tds.eq(3).text() != '-' && tds.eq(4).text() != '-') {
        res.cashRate.push(tmpObj);
      }
    });

    fn.apply(this, [res]);
  });
};

// 822 中國信託
dataParser['822'] = function(fn) {
  dataRequest = $.get('https://www.ctbcbank.com/CTCBPortalWeb/appmanager/ebank/rb?_nfpb=true&_pageLabel=TW_RB_CM_ebank_018001&_windowLabel=T31400173241287027448950', function(htmlStr) {
    htmlStr = htmlStr.replace(/<img[^>]*>/ig, '');

    var dom = $(htmlStr);
    var datetime = dom.find('#pageForm\\3atwdDiv .answer table tr:nth-child(2) > td').text().substring(5, 21);
    var dataTable = dom.find('#mainTable tr');
    var res = {};

    res.datetime = datetime;
    res.cashRate = [];
    res.spotRate = [];

    dataTable.each(function(i, el) {
      if (i === 0) return;
      var tds = $(this).find('td');

      var tmpObj = {
        title:      $.trim(tds.eq(0).text()),
        priceIN:    (tds.eq(1).text()-0).toString(),
        priceOUT:   (tds.eq(2).text()-0).toString()
      };
      if (tds.eq(1).text() != '' && tds.eq(2).text() != '') {
        res.cashRate.push(tmpObj);
      }

      tmpObj = {
        title:      $.trim(tds.eq(0).text()),
        priceIN:    (tds.eq(3).text()-0).toString(),
        priceOUT:   (tds.eq(4).text()-0).toString()
      };
      if (tds.eq(3).text() != '' && tds.eq(4).text() != '') {
        res.spotRate.push(tmpObj);
      }
    });

    fn.apply(this, [res]);
  });
};
