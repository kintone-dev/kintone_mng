(function(){
  'use strict';
  // 新規、編集、複製ボタン非表示
  var events_ced=[
    'app.record.index.show',
    'app.record.detail.show',
    'app.record.create.show',
    'app.record.edit.show',
    'app.record.print.show',
    'app.report.show',
    'portal.show',
    'space.portal.show'
  ];
  kintone.events.on(events_ced, function(event){
    $('.gaia-argoui-app-menu-add').remove();
    $('.recordlist-edit-gaia').remove();
    $('.recordlist-remove-gaia').remove();
    $('.gaia-argoui-app-menu-edit').remove();
    $('.gaia-argoui-app-menu-copy').remove();
    return event;
  });

  // 
  kintone.events.on(['app.record.edit.show'], function(event){    
    event.record.mName.disabled = true;
    event.record.mCode.disabled = true;
    event.record.mNickname.disabled = true;
    event.record.mType.disabled = true;
    event.record.mVendor.disabled = true;
    event.record.mClassification.disabled = true;
    if(event.record.mType.value!='パッケージ品') setFieldShown('packageComp', false);
    for (var sti in event.record.packageComp.value){
      event.record.packageComp.value[sti].value.pc_mVendor.disabled=true;
      event.record.packageComp.value[sti].value.pc_mType.disabled=true;
      event.record.packageComp.value[sti].value.pc_mCode.disabled=true;
      event.record.packageComp.value[sti].value.pc_mName.disabled=true;
      event.record.packageComp.value[sti].value.pc_Num.disabled=true;
    }
    [].forEach.call(document.getElementsByClassName("subtable-operation-gaia"), function(button){ button.style.display = 'none'; });
    return event;
  });
})();