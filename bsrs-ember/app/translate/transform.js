import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";

export default DS.Transform.extend({
  deserialize: function(serialized) {
  	console.log(serialized);
    return t(serialized);
  },

  serialize: function(deserialized) {
    console.log("I'm here.");
    return t(deserialized);
  }
});
