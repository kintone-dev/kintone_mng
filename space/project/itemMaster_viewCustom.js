(function(){
  'use strict';
  
  kintone.events.on(['app.record.edit.show'], function(event){
    event.record.mName.disabled = true;
    event.record.mCode.disabled = true;
    event.record.mNickname.disabled = true;
    event.record.mType.disabled = true;
    event.record.mVendor.disabled = true;
    event.record.endservice.disabled = true;

    return event;
  });

  kintone.events.on(['app.record.index.show'], function(event){
    $('.gaia-argoui-app-menu-add').remove();

    return event;
  });
})();