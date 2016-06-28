import Ember from 'ember';

var copySettingsToFirstLevel = (obj) => {
  var newState = {};
  var inherited = obj.inherited || {};
  for(var s in inherited) {
    var inheritedKeys = inherited[s];
    var keys = Object.keys(inheritedKeys);

    for(var i=0; i < keys.length; i++) {
      var key = keys[i];
      if(key === 'value') {
        newState[s] = obj.inherited[s][key];
      }
    }
  }
  return Ember.assign(obj, newState);
};

export default copySettingsToFirstLevel;
