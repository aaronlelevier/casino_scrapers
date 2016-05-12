import Ember from 'ember';
const { computed, defineProperty } = Ember;
import injectUUID from 'bsrs-ember/utilities/uuid';

export default Ember.Component.extend({
  classNames: ['dt-modal'],
  uuid: injectUUID('uuid'),
  /* 
   * @method init - fieldsObj setup
   * contains {key}-(id of field), {num}-(0 or 1), {value}-ongoing value of field, {required}, and {label}
   * num of 0 indicates fields has been fullfilled, 1 means unfullfilled
   * existing_ticket_request strings are parsed and a Map object is created for deep linking. May or may not contain a label
   */
  init() {
    this._super(...arguments);
    const fields = this.get('model.fields');
    const existing_ticket_request = this.get('ticket.request');
    const fieldsObj = new Map(); 
    if (existing_ticket_request) {
      const [request_label, request_value] = existing_ticket_request && existing_ticket_request.split(': ');
      if (request_label) {
        fieldsObj.set(this.get('uuid').v4(), { label: request_value ? request_label : '', num: 0, value: request_value || request_label });
      }
    }
    fields.forEach((field) => {
      fieldsObj.set(field.get('id'), { label: field.get('label'), num: 1, value: '', required: field.get('required') });
    }); 
    defineProperty(this, 'fieldsObj', undefined, fieldsObj);
  },
  /*
   * @method willDestroy
   * send off patch request in order to add new dt_path if user bails on page based on current dtd id instead of destination id
   * need to prevent patch if transitioning from one to another
   */
  // willDestroy() {
  //   const ticket = this.get('ticket');
  //   const model = this.get('model');
  //   this.attrs.linkClick(model, ticket, model);
  //   this._super();
  // },
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
     * action is either 'post' or 'patch'
     */
    linkClick(link, ticket, model, action) {
      this.attrs.linkClick(link, ticket, model, action);
    }
  }
});
