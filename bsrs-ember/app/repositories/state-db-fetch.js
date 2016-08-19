import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import { STATE_URL } from 'bsrs-ember/utilities/urls';

export default Ember.Object.extend({
  type: 'state',
  findState(search) {
    search = search ? search.trim() : search;
    if (search) {
      return PromiseMixin.xhr(`${STATE_URL}tenant/?search=${search}`, 'GET').then((response) => {
        return response.results;
      });
    }
  }
});
