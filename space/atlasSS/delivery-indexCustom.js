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
        var currentDate = new Date();
        var deleteData = [];

        //90日以上経ったデータを配列に格納
        for (var di in resp.records) {
          var createDate = new Date(resp.records[di].更新日時.value);
          var dateComp = currentDate.getTime() - createDate.getTime();

          if (dateComp > 7776000 * 1000) {
            deleteData.push(resp.records[di].$id.value)
          }
        }

        deleteRecords(kintone.app.getId(), deleteData);

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

      kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReqBody)
        .then(function (resp) {
          var shipList = resp.records;
          console.log(shipList);

          //新規申込データ作成
          var postMemData = []

          //故障品データ作成
          var putDefData = []

          //交換品query
          var getDefQueryArray = [];
          var getDefBody = {
            'app': sysid.DEV.app_id.sNum,
            'query': ''
          };

          //交換品データ作成
          var putRepData = []

          for (let ri in shipList) {
            if (shipList[ri].application_type.value.match(/新規申込/)) {
              var postBody_member = {
                'member_id': {
                  value: shipList[ri].member_id.value
                },
                'member_type': {
                  value: shipList[ri].member_type.value
                },
                'application_datetime': {
                  value: shipList[ri].application_datetime.value
                },
                'application_type': {
                  value: shipList[ri].application_type.value
                }
              };

              postMemData.push(postBody_member);
            } else if (resp.records[ri].application_type.value.match(/故障交換/)) {
              var putDefBody_sNum = {
                'updateKey': {
                  'field': 'sNum',
                  'value': resp.records[ri].failure_sNum.value
                },
                'record': {
                  'sState': {
                    'value': '故障品'
                  },
                  'sDstate': {
                    'value': '検証待ち'
                  }
                }
              };

              var putRepBody_sNum = {
                'updateKey': {
                  'field': 'sNum',
                  'value': resp.records[ri].replacement_sNum.value
                },
                'defKey': resp.records[ri].failure_sNum.value,
                'appType': shipList[ri].application_type.value,
                'shipDate': shipList[ri].shipping_datetime.value,
                'record': ''
              };


              getDefQueryArray.push('sNum = ');
              getDefQueryArray.push('"' + resp.records[ri].failure_sNum.value + '"');
              getDefQueryArray.push(' or ');

              putDefData.push(putDefBody_sNum);
              putRepData.push(putRepBody_sNum);
            }
          }

          if (getDefQueryArray.slice(-1)[0].match(/or/)) {
            getDefQueryArray.pop();
          }

          var getDefQuery = getDefQueryArray.join('');

          getDefBody.query = getDefQuery;
          kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getDefBody)
            .then(function (resp) {
              var defRec = resp.records;

              for (let rd in putRepData) {
                var defKey = putRepData[rd].defKey;
                for (let ri in defRec) {
                  if (defKey == defRec[ri].sNum.value) {
                    delete defRec[ri].$id;
                    delete defRec[ri].$revision;
                    delete defRec[ri].sDstate;
                    delete defRec[ri].sState;
                    delete defRec[ri].レコード番号;
                    delete defRec[ri].作成日時;
                    delete defRec[ri].作成者;
                    delete defRec[ri].ステータス;
                    delete defRec[ri].更新者;
                    delete defRec[ri].更新日時;

                    putRepData[rd].record = defRec[ri];
                  }
                }
              }

              for (let rd in putRepData) {
                putRepData[rd].record.sendDate.value = putRepData[rd].shipDate;
                putRepData[rd].record.sendType.value = putRepData[rd].appType;

                delete putRepData[rd].defKey;
                delete putRepData[rd].appType;
                delete putRepData[rd].shipDate;
                delete putRepData[rd].record.sNum;
              }

            }).catch(function (error) {
              console.log(error);
            });

          postRecords(sysid.ASS.app_id.member, postMemData);
          putRecords(sysid.DEV.app_id.sNum, putDefData);
          putRecords(sysid.DEV.app_id.sNum, putRepData);

        }).catch(function (error) {
          console.log(error);
        });

    });

  });
})();