import Ember from 'ember';
const { computed, defineProperty } = Ember;

export default Ember.Component.extend({
  classNames: ['dt-modal'],
  /* 
   * @method init - fieldsObj setup
   * contains {key}-(id of field), {num}-(0 or 1), {value}-ongoing value of field, {required}, and {label}
   * num of 0 indicates fields has been fullfilled, 1 means unfullfilled
   */
  init() {
    this._super(...arguments);
    const fields = this.get('model.fields');
    const fieldsObj = new Map(); 
    fields.forEach((field) => {
      fieldsObj.set(field.get('id'), { label: field.get('label'), num: 1, value: '', required: field.get('required') });
    }); 
    defineProperty(this, 'fieldsObj', undefined, fieldsObj);
  },
  /* @method fieldsCompleted
   * switches link next button on and off as long as all required fields are fullfilled
   * uses the num property to increment required length
   */
  fieldsCompleted: Ember.computed('ticket.requestValues.[]', function() {
    const objs = this.get('fieldsObj').values();
    let len = 0;
    for (var obj of objs) {
      /* jshint ignore:start */
      obj.required ? len += obj.num : null;
      /* jshint ignore:end */
    }
    return len === 0 ? undefined : 'disabled';
  }),
  /*
   * EventBus
   */
  eventbus: Ember.inject.service(),
  _setup: Ember.on('init', function() {
    this.get('eventbus').subscribe('bsrs-ember@component:field-element-display', this, 'onFieldUpdate');
  }),
  _teardown: Ember.on('willDestroyElement', function() {
    this.get('eventbus').unsubscribe('bsrs-ember@component:field-element-display');
  }),
  /*
   * @method onFieldUpdate
   * sets key, value in fieldsObj (Map)
   * updateRequest sent to controller to update ticket.requestValues based on 'label:value'
   * @param {string} id
   * @param {number} num  0 (fullfilled) or 1 (unfullfilled)
   */
  onFieldUpdate(child, eventName, {field, num, value, ticket}) {
    let fieldsObj = this.get('fieldsObj');
    fieldsObj.set(field.get('id'), { num: num, value: value, label: field.get('label'), required: field.get('required') });
    this.attrs.updateRequest(fieldsObj, ticket);
  },
  actions: {
    /* 
     * @method linkClick
     * closure action calls linkClick on controller
     */
    linkClick(link, ticket, model) {
      this.attrs.linkClick(link, ticket, model);
    }
  }
});
