import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import { COUNTRY_URL } from 'bsrs-ember/utilities/urls';

export default Ember.Object.extend({
  type: 'state',
  findCountry(search) {
    search = search ? search.trim() : search;
    if (search) {
      return PromiseMixin.xhr(`${COUNTRY_URL}tenant/?search=${search}`, 'GET').then((response) => {
        return response.results;
      });
    }
  }
});
