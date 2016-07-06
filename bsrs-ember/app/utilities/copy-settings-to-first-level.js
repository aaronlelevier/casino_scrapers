import Ember from 'ember';

var copySettingsToFirstLevel = (obj) => {
  var newState = {};
  var inherited = obj.inherited || {};
  for (var inheritedKey in inherited) {
    var inheritedObject = inherited[inheritedKey];
    newState[inheritedKey] = obj.inherited[inheritedKey]['value'];
  }
  return Ember.assign(obj, newState);
};

export default copySettingsToFirstLevel;