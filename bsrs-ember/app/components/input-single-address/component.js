import Ember from 'ember';
const { run } = Ember;
import injectRepo from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend({
  countryDbFetch: injectRepo('country-db-fetch'),
  stateDbFetch: injectRepo('state-db-fetch'),
  actions: {
    delete(entry) {
      run(() => {
        this.get('model').remove_address(entry.get('id'));
      });
    },
  }
});
