import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend({
  repository: injectRepo('location'),
  extra_params: Ember.computed(function() {
    return {location_level: this.get('model').get('lookups').id};
  })
});
