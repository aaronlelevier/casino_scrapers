import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import Base from 'bsrs-ember/components/mobile/base';

export default Base.extend({
  simpleStore: Ember.inject.service(),
  countryRepo: injectRepo('country-db-fetch'),
  dtdRepo: injectRepo('dtd'),
  currencies: Ember.computed(function() {
    return this.get('simpleStore').find('currency');
  })
});
