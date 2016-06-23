import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
  personCurrent: Ember.inject.service(),
  model(params) {
    let personCurrent = this.get('personCurrent');
    return {
      settings_id: personCurrent.get('model').get('tenant')
    };
  }
});
