import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
  repository: inject('ticket'),
  model() {
    return this.get('repository').findTicketDrafts();
  }
});
