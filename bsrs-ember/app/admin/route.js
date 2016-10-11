import Ember from 'ember';

export default Ember.Route.extend({
  personCurrent: Ember.inject.service(),
  model() {
    let personCurrent = this.get('personCurrent');
    return {
      settings_id: personCurrent.get('model').get('tenant')
    };
  }
});
