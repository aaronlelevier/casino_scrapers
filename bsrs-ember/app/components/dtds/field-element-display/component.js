import Ember from 'ember';

export default Ember.Component.extend({
  eventbus: Ember.inject.service(),
  observeValid: Ember.observer('init', function() {
    Ember.run.once(this, 'processValid');
  }),
  /*
   * processValid
   * Send up field, num (1 or 0), value, and ticket to dtd-preview
   */
  processValid(field, num, value, ticket) {
    this.get('eventbus').publish('bsrs-ember@component:field-element-display', this, 'onFieldUpdate', { field, num, value, ticket });
  },

  classNames: ['form-group'],
  actions: {
    /*
     * updateRequest 1 unfullfilled; 0 fullfilled field 
     * @param {string} value ...passed from option
     * @param {object} opts ...passed from textarea or input as last argument
     * @return processValid is sent in the event bus to dtd-preview and updates fieldsObj Map object
     */
    updateRequest(value, ticket, ...opts) {
      if(!value) {
        value = opts[0];
      }
      const field = this.get('field');
      if (!value) {
        this.processValid(field, 1, value, ticket);
      } else if (value) {
        this.processValid(field, 0, value, ticket);
      }
    }
  },
});
