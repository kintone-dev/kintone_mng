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

        console.log(deleteData);

        var deleteBody = {
          'app': kintone.app.getId(),
          'ids': deleteData
        };

        //配列の長さが100より大きい場合
        if (deleteData.length > 100) {
          //配列の長さを100で割って切り捨て
          var loopNum = Math.floor(deleteData.length / 100);
          for (var i = 0; i <= loopNum; i++) {
            if (i == 0) {
              //100ずつ配列をスライスして格納
              var cutDeleteData = deleteData.slice(0, 100);
              deleteBody = {
                'app': kintone.app.getId(),
                'ids': cutDeleteData
              };

              kintone.api(kintone.api.url('/k/v1/records.json', true), 'DELETE', deleteBody).then(function (resp) {
                location.reload();
                console.log('データを削除いたしました。')
              }).catch(function (error) {
                console.log(error);
              });

            } else {
              //100ずつ配列をスライスして格納
              var cutDeleteData = deleteData.slice(i * 100, (i * 100) + 100);

              deleteBody = {
                'app': kintone.app.getId(),
                'ids': cutDeleteData
              };

              kintone.api(kintone.api.url('/k/v1/records.json', true), 'DELETE', deleteBody).then(function (resp) {
                location.reload();
                console.log('データを削除いたしました。')
              }).catch(function (error) {
                console.log(error);
              });
            }
          }

        } else {
          kintone.api(kintone.api.url('/k/v1/records.json', true), 'DELETE', deleteBody).then(function (resp) {
            location.reload();
            console.log('データを削除いたしました。')
          }).catch(function (error) {
            console.log(error);
          });
        }

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

          //新規申込用json作成
          var postNewJson = {
            'app': sysid.ASS.app_id.member,
            'records': []
          }

          //新規申込データ作成
          var postNewData = []

          //故障品json作成
          var putDefJson = {
            'app': sysid.DEV.app_id.sNum,
            'records': []
          }

          //故障品データ作成
          var putDefData = []

          //交換品query
          var getDefQueryArray = [];
          var getDefBody = {
            'app': sysid.DEV.app_id.sNum,
            'query': ''
          };


          //交換品json作成
          var putRepJson = {
            'app': sysid.DEV.app_id.sNum,
            'records': []
          }

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

              postNewData.push(postBody_member);
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
                'record': ''
              };


              getDefQueryArray.push('sNum = ');
              getDefQueryArray.push('"' + resp.records[ri].replacement_sNum.value + '"');
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
              
              for(let rd in putRepData){
                var rdKey =  putRepData[rd].updateKey.value;
                for(let ri in defRec){
                  console.log(defRec[ri]);
                  if(rdKey = defRec[ri].sNum.value){
                    delete defRec[ri].$id;
                    delete defRec[ri].$revision;
                    delete defRec[ri].sNum;
                    delete defRec[ri].sDstate;
                    delete defRec[ri].sState;
                    delete defRec[ri].sendDate;
                    delete defRec[ri].sendType;
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

            }).catch(function (error) {
              console.log(error);
            });


          postNewJson.records = postNewData;
          putDefJson.records = putDefData;
          putRepJson.records = putRepData;

          console.log(postNewJson);
          console.log(putDefJson);
          console.log(putRepJson);
          // kintone.api(kintone.api.url('/k/v1/records', true), 'POST', postNewJson);
          // kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', putDefJson);
          // kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', putRepJson);

          // 申し込み種別が新規申し込みの時
          // if (shipList[ri].application_type.value.match(/新規申込/)) {
          //   console.log(postBody_member);

          //   kintone.api(kintone.api.url('/k/v1/records', true), 'POST', postBody_member)
          //     .then(function (resp) {

          //       // var logList = shipList[ri].syncLog_list.value
          //       // var appendLog = {
          //       //   value: {
          //       //     syncLog_date: {
          //       //       value: String(luxon.DateTime.local().toISO())
          //       //     },
          //       //     syncLog_type: {
          //       //       value: 'KT-会員情報'
          //       //     },
          //       //     syncLog_status: {
          //       //       value: 'success'
          //       //     },
          //       //     syncLog_message: {
          //       //       value: '会員情報を連携しました。'
          //       //     }
          //       //   }
          //       // }

          //       // logList.push(appendLog);

          //       // // ログデータ
          //       // var logBody_ship = {
          //       //   app: kintone.app.getId(),
          //       //   id: parseInt(shipList[ri].レコード番号.value),
          //       //   record: {
          //       //     working_status: {
          //       //       value: '必要情報入力済み'
          //       //     },
          //       //     syncLog_list: {
          //       //       value: logList
          //       //     }
          //       //   }
          //       // };

          //       // console.log(logBody_ship);

          //       // kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', logBody_ship)
          //       //   .then(function (resp) {
          //       //     console.log('success log put');
          //       //   }).catch(function (error) {
          //       //     console.log(error);
          //       //   });

          //     }).catch(function (error) {

          //       var logList = shipList[ri].syncLog_list.value
          //       var appendLog = {
          //         value: {
          //           syncLog_date: {
          //             value: String(luxon.DateTime.local().toISO())
          //           },
          //           syncLog_type: {
          //             value: 'KT-会員情報'
          //           },
          //           syncLog_status: {
          //             value: 'error'
          //           },
          //           syncLog_message: {
          //             value: '会員情報の連携に失敗しました。'
          //           }
          //         }
          //       }

          //       logList.push(appendLog);

          //       // ログデータ
          //       var logBody_ship = {
          //         app: kintone.app.getId(),
          //         id: parseInt(shipList[ri].レコード番号.value),
          //         record: {
          //           syncLog_list: {
          //             value: logList
          //           }
          //         }
          //       };

          //       console.log(logBody_ship);

          //       kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', logBody_ship)
          //         .then(function (resp) {
          //           console.log('error log put');
          //         }).catch(function (error) {
          //           console.log(error);
          //         });

          //       console.log(error);

          //     });

          // } else if (resp.records[ri].application_type.value.match(/故障交換/)) {
          //   var failure_sNum = resp.records[ri].failure_sNum.value;
          //   var replacement_sNum = resp.records[ri].replacement_sNum.value;

          //   var getFSnumBody = {
          //     'app': sysid.DEV.app_id.sNum,
          //     'query': 'sNum="' + failure_sNum + '"',
          //   };

          //   //故障品シリアルナンバーの情報取得
          //   kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getFSnumBody)
          //     .then(function (resp) {
          //       var failureInfo = resp.records;

          //       console.log(failureInfo);

          //       if (failureInfo[0].sState.value.match(/故障品/)) {
          //         defective(failure_sNum, replacement_sNum);
          //       } else {
          //         console.log('故障品ではありません。');
          //       }

          //     }).catch(function (error) {
          //       console.log(error);
          //     });

          // }




        }).catch(function (error) {
          console.log(error);
        });
    });

  });
})();