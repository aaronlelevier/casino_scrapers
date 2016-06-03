var copySettingsToFirstLevel = (obj) => {
  var newState = {};
  var settings = obj.settings || {};

  for(var s in settings) {
    var setting = settings[s];
    var keys = Object.keys(setting);

    for(var i=0; i < keys.length; i++) {
      var key = keys[i];
      if(key === 'value') {
        newState[s] = obj.settings[s][key];
      }
    }
  }
  newState.settings_object = obj.settings;
  delete obj.settings;
  return Object.assign({}, obj, newState);
};

export default copySettingsToFirstLevel;