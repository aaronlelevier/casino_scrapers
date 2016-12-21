import Ember from 'ember';
const { inject } = Ember;

export default Ember.Controller.extend({
  personCurrent: inject.service(),
  permissions: Ember.computed.alias('personCurrent.permissions'),
});
