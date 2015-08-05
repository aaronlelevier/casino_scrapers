import DS from 'ember-data';
import { translationMacro as t } from 'ember-i18n';

export default DS.Transform.extend({
  deserialize: function(serialized) {
    return t(serialized);
  },

  serialize: function(deserialized) {
    return t(deserialized);
  }
});
