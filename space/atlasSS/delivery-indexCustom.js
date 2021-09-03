(function () {
  'use strict';

  kintone.events.on('app.record.index.show', function (event) {
    var del_records = setBtn_index('btn_del_records', '処理済みデータ削除');
    var sync_kintone = setBtn_index('btn_sync_kintone', '内部連携');

    //処理済みデータ削除
    $('#' + del_records.id).on('click', function () {
      var deleteReqBody = {
        'app': kintone.app.getId(),
        'query': 'working_status in (\"登録完了\") and person_in_charge in (\"ATLAS Smart Security\") order by 更新日時 asc'
      };
      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', deleteReqBody).then(function (resp) {
        console.log(resp);

        // var createDate = 

        var deleteBody = {
          'app': kintone.app.getId(),
          'records': []
        };

        var dBody = {};

        dBody = {
          $id: {
            value: '47'
          }
        };

        deleteBody.records.push(dBody);

        kintone.api(kintone.api.url('/k/v1/records.json', true), 'DELETE', deleteBody).then(function (resp) {
          console.log(resp.records);
        }).catch(function (error) {
          console.log(error);
        });  

      }).catch(function (error) {
        console.log(error);
      });
    });    

    //内部連携ボタンクリック時
    $('#' + sync_kintone.id).on('click', function () {
      var getReqBody = {
        'app': kintone.app.getId(),
        'query': 'working_status in (\"TOASTCAM登録待ち\") and person_in_charge in (\"Accel Lab\") order by 更新日時 asc'
      };

      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReqBody).then(function (resp) {
        console.log(resp.records);

        // 会員情報関連
        var postBody_member = {
          'app': sysid.ASS.app.member,
          'records': []
        };

        // var postBody_member = {
        //   'app': sysID.ASS.app.aim,
        //   'records': []
        // };

        // シリアル情報関連
        // var putBody_sNum = {
        //   'app': sysID.DIPM.app.sn,
        //   'records': []
        // };

        for (var ri in resp.records) {
          var mBody = {};
          if (resp.records[ri].application_type.value.match(/新規申込/)){
            mBody = {
              member_id: {
                value: resp.records[ri].member_id.value
              },
              member_type: {
                value: resp.records[ri].member_type.value
              },
              application_datetime: {
                value: resp.records[ri].application_datetime.value
              },
              application_type: {
                value: resp.records[ri].application_type.value
              }
            };
            postBody_member.records.push(mBody);
          } else if (resp.records[ri].application_type.value.match(/故障交換/)){

          }
          // if (resp.records[ri].info_status.value == 'new') {
          // } else if (resp.records[ri].info_status.value == 'update') {
          //   mBody = {
          //     'updateKey': {
          //       'field': 'member_id',
          //       'value': resp.records[ri].member_id.value
          //     },
          //     'record': {
          //       'member_type': {
          //         'value': resp.records[ri].member_type.value
          //       },
          //       'application_datetime': {
          //         'value': resp.records[ri].member_type.value
          //       },
          //       'application_type': {
          //         'value': resp.records[ri].member_type.value
          //       }
          //     }
          //   };
          //   putBody_member.records.push(mBody);
          // }
          // var app_type = resp.records[ri].application_type.value.match('故障交換');
          // if (app_type) {
          //   // 故障品の処理
          //   console.error(resp.records[ri].$id.value + '故障');
          //   /*
          //   var getTarSN={
          //     'app': sysID.DIPM.app.sn,
          //     'query': 'sNum="'+resp.records[ri].failure_sNum.value+'"'
          //   };
          //   */
          // } else {
          //   // 販売分）シリアル番号処理
          //   var memID = resp.records[ri].member_id.value;
          //   var appDay = resp.records[ri].application_datetime.value;
          //   var bizID = resp.records[ri].toastcam_bizUserId.value;
          //   var bizPW = resp.records[ri].toastcam_bizUserPassword.value;

          //   var shipTable = resp.records[ri].deviceList.value;

          //   for (var i in shipTable) {
          //     //get serial numbers
          //     var ship_sNums = shipTable[i].value.sNums.value;
          //     var get_sNums = ship_sNums.split(/\r\n|\n/);
          //     //except Boolean
          //     var sNums = get_sNums.filter(Boolean);

          //     for (var y in sNums) {
          //       var snRecord = {
          //         'updateKey': {
          //           'field': 'sNum',
          //           'value': sNums[y]
          //         },
          //         'record': {
          //           'member_id': {
          //             'value': memID
          //           },
          //           'application_datetime': {
          //             'value': appDay
          //           },
          //           'toastcam_bizUserId': {
          //             'value': bizID
          //           },
          //           'toastcam_bizUserPassword': {
          //             'value': bizPW
          //           }
          //         }
          //       };
          //       putBody_sNum.records.push(snRecord);
          //     }
          //   }
          // }
        }
        // console.log(putBody_member);
        // console.log(putBody_sNum);

        console.log(postBody_member);
        var postMenber_result = kintone.api(kintone.api.url('/k/v1/records.json', true), 'POST', postBody_member);
        postMenber_result.then(function(resp){
          console.log(resp);
          console.log('新規申し込み会員情報をPOSTしました。');
        }).catch(function(error){
          console.log(error);
        });

        /*
        kintone.api(kintone.api.url('/k/v1/records.json', true), 'PUT', putBody_member);
        kintone.api(kintone.api.url('/k/v1/records.json', true), 'PUT', putBody_sNum);
        */
      }).catch(function (error) {
        console.log(error);
      });
    });

  });
})();