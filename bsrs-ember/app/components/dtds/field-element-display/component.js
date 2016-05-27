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
  processSelect(field, num, value, ticket, option) {
    this.get('eventbus').publish('bsrs-ember@component:field-element-display:select', this, 'onSelectUpdate', { field, num, value, ticket, option });
  },
  processClickOption(field, num, value, ticket, option) {
    this.get('eventbus').publish('bsrs-ember@component:field-element-display:option', this, 'onOptionUpdate', { field, num, value, ticket, option });
  },

  classNames: ['form-group'],
  actions: {
    /*
     * @method updateRequest 1 unfullfilled; 0 fullfilled field 
     * @param {string} value ...passed from option
     * @param {string} ticket 
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
    },
    /*
     * @method updateSelect 1 unfullfilled; 0 fullfilled field 
     * TODO: user needs to be able to unselect an option
     * @return processSelect
     */
    updateSelect(value, ticket, option) {
      const field = this.get('field');
      // if (!value) {
      //   this.processSelect(field, 1, value, ticket);
      // } else if (value) {
        this.processSelect(field, 0, value, ticket, option);
      // }
    },
    /*
     * @method updateCheckbox
     * checked property to determine if should increment num count in dtd-preview
     * toggle option isChecked property in order to handle processValid below
     */
    updateCheckbox(value, ticket, option) {
      option.toggleProperty('isChecked');
      const event = arguments[3];
      const field = this.get('field');
      if (!event.currentTarget.checked) {
        this.processClickOption(field, 1, '', ticket, option);
      } else {
        this.processClickOption(field, 0, value, ticket, option);
      }
    }
  },
});
