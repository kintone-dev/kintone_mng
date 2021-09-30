(function () {
  'use strict';

  kintone.events.on('app.record.detail.process.proceed', async function (event) {
    var nStatus = event.nextStatus.value;
    var sendDate = event.record.arrivalDate.value;
    sendDate = sendDate.replace(/-/g, '');
    sendDate = sendDate.slice(0, -2);
    var reportData = await checkEoMReport(sendDate);
    if (reportData == false) {
      event.error = '対応した日付のレポートは締切済みです。';
      return event;
    }

    if (nStatus === '仕入完了') {
      var stockData = await stockCtrl(event, kintone.app.getId());
      console.log(stockData);
      await reportCtrl(event, kintone.app.getId());

    // 月次処理に情報連携
    // var putRepoData = [];
    // var putRepoBody = {
    //   'id': reportData.records[0].$id.value,
    //   'record': {
    //     'inventoryList': {
    //       'value': reportData.records[0].inventoryList.value
    //     }
    //   }
    // }
    // for (var i in stockData) {
    //   if (putRepoBody.record.inventoryList.value.some(item => item.value.sys_code.value === stockData[i].sysCode)) {
    //     for (var j in putRepoBody.record.inventoryList.value) {
    //       if (putRepoBody.record.inventoryList.value[j].value.sys_code.value == stockData[i].sysCode) {
    //         putRepoBody.record.inventoryList.value[j].value.arrivalNum.value = stockData[i].arrivalNum
    //       }
    //     }
    //   } else {
    //     var newReportListBody = {
    //       'value': {
    //         'sys_code': {
    //           'value': stockData[i].sysCode
    //         },
    //         'stockLocation': {
    //           'value': stockData[i].uName
    //         },
    //         'arrivalNum': {
    //           'value': stockData[i].arrivalNum
    //         }
    //       }
    //     }
    //     putRepoBody.record.inventoryList.value.push(newReportListBody);
    //   }
    // }
    // putRepoData.push(putRepoBody);
    // putRecords(sysid.INV.app_id.report, putRepoData);

    }
  });
})();