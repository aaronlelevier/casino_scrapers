import Ember from 'ember';
const { computed, defineProperty } = Ember;
import injectUUID from 'bsrs-ember/utilities/uuid';

export default Ember.Component.extend({
  classNames: ['dt-modal'],
  uuid: injectUUID('uuid'),
  simpleStore: Ember.inject.service(),
  /* 
   * @method init - fieldsObj setup
   * contains {key}-(id of field), {num}-(0 or 1), {value}-ongoing value of field, {required}, and {label}
   * num of 0 indicates fields has been fullfilled, 1 means unfullfilled
   * existing_ticket_request strings are parsed and a Map object is created for deep linking. May or may not contain a label
   * dt_path sets properties on fields/options to persist values on deep link
   * displayValue is set for fields and options to display value if deep link or user navigates back
   */
  init() {
    this._super(...arguments);
    const fields = this.get('model.fields');
    const existing_ticket_request = this.get('ticket.request');
    const dt_path = this.get('ticket.dt_path');
    const fieldsObj = new Map(); 
    if (existing_ticket_request) {
      //this covers existing fields and options values
      const [request_label, request_value] = existing_ticket_request && existing_ticket_request.split(': ');
      if (request_label) {
        fieldsObj.set(this.get('uuid').v4(), { label: request_value ? request_label : '', num: 0, value: request_value || request_label });
      }
    }
    fields.forEach((field) => {
      const field_id = field.get('id');
      //TODO: need to incldue option values in here
      fieldsObj.set(field_id, { label: field.get('label'), num: 1, value: '', required: field.get('required') });
    }); 
    const fields_ids = fields.mapBy('id');
    /* jshint ignore:start */
    dt_path && dt_path.forEach((dt_obj) => {
      // fields - set displayValue
      dt_obj['dtd']['fields'] && dt_obj['dtd']['fields'].forEach((dt_field) => {
        const _id = dt_field.id;
        const store = this.get('simpleStore');
        if (fields_ids.includes(_id)) {
          const field = this.get('simpleStore').find('field', {id: _id});
          //displayValue needs to be associated with certain dtd, because might use same field in different dtd
          store.push('field', { id: _id, displayValue: {dtd_id: dt_obj['dtd']['id'], value: dt_field.value} });
        }
        // options - set displayValue if field object has options and dt_path has options w/ same id
        const field = store.find('field', dt_field.id);
        const options_ids = field.get('options').map((option) => {
          return option.get('id');
        }) || [];
        dt_field['options'] && dt_field['options'].forEach((dt_option_id) => {
          if (options_ids.includes(dt_option_id)) {
            const store = this.get('simpleStore');
            const option = store.find('option', {id: dt_option_id});
            store.push('option', { id: dt_option_id, isChecked: true });
          }
        });
      });
    });
    /* jshint ignore:end */
    /*
     * @property fieldsObj - used to keep track of state of field (and options if present)
     * key = field id / value is { num (0 or 1), value, label of field, required, and options }
     * values determine joined ticket request value when patched up
     * fields and options save in ticket dt_path object in dtPathMunge method
     */
    defineProperty(this, 'fieldsObj', undefined, fieldsObj);
  },
  /*
   * @method willDestroy
   * if user closes browser with in flight changes
   * send off patch request in order to add new dt_path if user bails on page based on current dtd id instead of destination id
   * only way you can patch is is by clicking link button or modal 'yes' when navigating back in decision tree
   */
  // willDestroy() {
  //   const ticket = this.get('ticket');
  //   const model = this.get('model');
  //   const action = this.get('action');
  //   if (action === 'patch' && ticket.get('isDirty') && !ticket.get('hasSaved')) {
  //     this.attrs.linkClick(undefined, ticket, model, 'patch', false);
  //   }
  //   this._super(...arguments);
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
    this.get('eventbus').subscribe('bsrs-ember@component:field-element-display:option', this, 'onOptionUpdate');
  }),
  _teardown: Ember.on('willDestroyElement', function() {
    this.get('eventbus').unsubscribe('bsrs-ember@component:field-element-display');
  }),
  /*
   * @method onFieldUpdate
   * sets key, value in fieldsObj (Map)
   * updateRequest sent to controller to update ticket.requestValues based on 'label:value'
   * fields may have multiple options that need to be included in value field.
   * @param {string} id
   * @param {number} num  0 (fullfilled) or 1 (unfullfilled)
   */
  onFieldUpdate(child, eventName, {field, num, value, ticket}) {
    let fieldsObj = this.get('fieldsObj');
    fieldsObj.set(field.get('id'), { num: num, value: value, label: field.get('label'), required: field.get('required') });
    this.attrs.updateRequest(fieldsObj, ticket);
  },
  /*
   * @method onOptionUpdate
   * sets key, value in fieldsObj (Map)
   * updateRequest sent to controller to update ticket.requestValues based on 'label:value'
   * optionValues: [] - fields may have multiple options that need to be included in value field.
   * "yes", "", "no", "yes" --> "label: no, yes"
   * @param {string} id
   * @param {number} num  0 (fullfilled) or 1 (unfullfilled)
   */
  onOptionUpdate(child, eventName, {field, num, value, ticket, option}) {
    let fieldsObj = this.get('fieldsObj');
    const fieldObj = fieldsObj.get(field.get('id'));
    const optionValues = fieldObj.optionValues || [];
    const indx = optionValues.indexOf(option.get('id'));
    if (indx > -1 && !value) {
      optionValues.splice(indx, 1);
    } else {
      optionValues.push(value);
    }
    const store = this.get('simpleStore');
    const fieldValue = optionValues.reduce((prev, opt) => {
      const option = store.find('option', opt.id);
      return prev += ', ' + option.text;
    }, '');
    fieldsObj.set(field.get('id'), { num: num, value: fieldValue, label: field.get('label'), required: field.get('required'), optionValues: optionValues });
    this.attrs.updateRequest(fieldsObj, ticket);
  },
  actions: {
    /* 
     * @method linkClick
     * closure action calls linkClick on controller
     * action is either 'post' or 'patch'
     */
    linkClick(link, ticket, model, action) {
      const fieldsObj = this.get('fieldsObj');
      this.attrs.linkClick(link, ticket, model, action, fieldsObj);
    }
  }
});
