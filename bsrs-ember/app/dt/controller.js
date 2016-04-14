import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Controller.extend({
  repository: inject('ticket'),
  actions: {
    optionSelect(value, label, ticket) {
      const requestValues = ticket.get('values') || [];
      /* jshint ignore:start */
      requestValues.includes(value) ? requestValues.removeObject(value) : requestValues.pushObject(value);
      /* jshint ignore:end */
      value = requestValues.join(' ,');
      this.get('store').push('ticket', {id: ticket.get('id'), request: value, requestValues: requestValues});
    },
  }
});
