import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
  simpleStore: Ember.inject.service(),
  model(params) {
    const store = this.get('simpleStore');
    const settings = store.find('setting');
    let general_settings = settings.filter(function(obj) {
      return obj.name === 'general';
    })[0];
    return {
      settings_id: general_settings.get('id')
    };
  }
});
