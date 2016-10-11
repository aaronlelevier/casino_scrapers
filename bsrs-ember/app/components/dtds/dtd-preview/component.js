import Ember from 'ember';
import on from 'ember-evented/on';
const { computed, defineProperty } = Ember;
import injectUUID from 'bsrs-ember/utilities/uuid';

export default Ember.Component.extend({
  classNames: ['dt-modal'],
  uuid: injectUUID('uuid'),
  simpleStore: Ember.inject.service(),
  /*
   * @method init - fieldsObj setup
   * existing_ticket_request strings are parsed and a Map object is created for deep linking. May or may not contain a label
   * dt_path sets properties on fields/options to persist values on deep link
   * displayValue is set for fields and options to display value in template if deep link or user navigates back
   */
  init() {
    this._super(...arguments);
    /*
     * @property fieldsObj - used to keep track of state of field (and options if present)
     * key = field id ... value is { num (0 or 1), value (based on user action), label of field, required, and options (array of ids)}
     * num of 0 indicates fields has been fullfilled, 1 means unfullfilled
     * field type is not needed since field id from template will be mapped to field in fieldsObj
     * values determine joined ticket request value when patched up to server
     * fields and options save in ticket dt_path object in dtPathMunge method
     * fieldsObj is updated with new fields in response of patch
     * optionValues - all options related to a field. Should just be those selected
     */
    const dt_id = this.get('model').get('id');
    const fields = this.get('model.fields');
    const dt_path = this.get('ticket.dt_path');
    const fieldsObj = this.get('fieldsObj') || new Map();
    //Initial Map() setup - Current DTD
    fields.forEach((field) => {
      const field_id = field.get('id');
      fieldsObj.set(field_id, { dtd_id: dt_id, label: field.get('label'), num: 1, value: '', required: field.get('required'), });
    });
    /* jshint ignore:start */
    dt_path && dt_path.forEach((dt_obj) => {
      // fields && options - set displayValue and isChecked on dt_path (existing) fieldsObjs to handle the case when user navigates back
      // select needs an option for that field to attach to and set it to selected. field.optionSelected. Cant use m2m setup as it is acting like a belongsTo when selected
      dt_obj['dtd']['fields'] && dt_obj['dtd']['fields'].forEach((dt_field) => {
        const _id = dt_field.id;
        const store = this.get('simpleStore');

        store.push('field', { id: _id, displayValue: dt_field.value });

        //TODO: this is setting each option with isChecked.  This is wrong
        dt_field['options'] && dt_field['options'].forEach((dt_option_id) => {
          store.push('option', { id: dt_option_id, isChecked: true });
        });
        //Old Map() setup from (dt_path) thus num = 0 since is fullfilled
        fieldsObj.set(_id, { dtd_id: dt_obj['dtd']['id'], label: dt_field.label, num: 0, value: dt_field.value, required: dt_field.required, optionValues: dt_field['options'] });
      });
    });
    /* jshint ignore:end */
    defineProperty(this, 'fieldsObj', undefined, fieldsObj);
  },

  /*
   * @method willDestroy
   * if user closes browser with in flight changes
   * send off patch request in order to add new dt_path if user bails on page based on current dtd id instead of destination id
   * only way you can patch is is by clicking link button or modal 'yes' when navigating back in decision tree
   */
  // willDestroy() {
  //   this._super(...arguments);
  //   const ticket = this.get('ticket');
  //   const model = this.get('model');
  //   const action = this.get('action');
  //   if (action === 'patch' && ticket.get('isDirty') && !ticket.get('hasSaved')) {
  //     this.attrs.linkClick(undefined, ticket, model, 'patch', false);
  //   }
  // },

  /* @method fieldsCompleted
   * switches link next button on and off as long as all required fields are fullfilled
   * uses the num property to increment required length
   * needs to only look at fieldObjs that are specific to a dtd.  User can not fill out all required fields and can navigate backwards and not have links disabled
   */
  fieldsCompleted: computed('ticket.requestValues.[]', function() {
    const objs = this.get('fieldsObj').values();
    const model_id = this.get('model').get('id');
    let len = 0;
    for (var obj of objs) {
      /* jshint ignore:start */
      if (obj.dtd_id === model_id) {
        obj.required ? len += obj.num : null;
      }
      /* jshint ignore:end */
    }
    return len === 0 ? undefined : 'disabled';
  }),
  /*
   * EventBus
   */
  eventbus: Ember.inject.service(),
  _setup: on('init', function() {
    this.get('eventbus').subscribe('bsrs-ember@component:field-element-display', this, 'onFieldUpdate');
    this.get('eventbus').subscribe('bsrs-ember@component:field-element-display:option', this, 'onOptionUpdate');
    this.get('eventbus').subscribe('bsrs-ember@component:field-element-display:select', this, 'onSelectUpdate');
  }),
  _teardown: on('willDestroyElement', function() {
    this.get('eventbus').unsubscribe('bsrs-ember@component:field-element-display');
    this.get('eventbus').unsubscribe('bsrs-ember@component:field-element-display:option');
    this.get('eventbus').unsubscribe('bsrs-ember@component:field-element-display:select');
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
    this.get('updateRequest')(fieldsObj, ticket);
  },
  /*
   * @method onSelectUpdate
   * need to reset optionValues because dt_path needs them if user navigates back to change selected option
   * @param option - may be undefined.  If no option, then set optionValues to []; otherwise set to option_id
   */
  onSelectUpdate(child, eventName, {field, num, value, ticket, option}) {
    const option_id = option ? option.get('id') : null;
    let fieldsObj = this.get('fieldsObj');
    const fieldObj = fieldsObj.get(field.get('id'));
    let optionValues = fieldObj.optionValues || [];
    if (!value) {
      optionValues = undefined;
    } else if (option_id) {
      optionValues = [option_id];
    }
    fieldsObj.set(field.get('id'), { num: num, value: value, label: field.get('label'), required: field.get('required'), optionValues: optionValues });
    this.get('updateRequest')(fieldsObj, ticket);
  },
  /*
   * @method onOptionUpdate
   * sets key, value in fieldsObj (Map)
   * updateRequest sent to controller to update ticket.requestValues based on 'label:value'
   * all options from dt_path are pushed into the store
   * optionValues: [] - fields may have multiple options that need to be included in value field. Initial setup populates fields optionValues
   * "yes", "", "no", "yes" --> "label: no, yes"
   * @param {string} id
   * @param {number} num  0 (fullfilled) or 1 (unfullfilled)
   */
  onOptionUpdate(child, eventName, {field, num, value, ticket, option}) {
    const option_id = option.get('id');
    let fieldsObj = this.get('fieldsObj');
    // find single fieldObj representing option's field
    const fieldObj = fieldsObj.get(field.get('id'));
    const optionValues = fieldObj.optionValues || [];
    const indx = optionValues.indexOf(option_id);
    // if option already in array from initial setup or dt_path && no value passed, remove
    if (indx > -1 && !value) {
      optionValues.splice(indx, 1);
    } else if (indx === -1 && value) {
      optionValues.push(option_id);
    }
    const store = this.get('simpleStore');
    let fieldValue = optionValues.reduce((prev, opt) => {
      const option = store.find('option', opt);
      return prev += ` ${option.get('text')}`;
    }, '');
    fieldValue = fieldValue.trim().replace(/\s+/g, ', ');
    fieldsObj.set(field.get('id'), { num: num, value: fieldValue, label: field.get('label'), required: field.get('required'), optionValues: optionValues });
    this.get('updateRequest')(fieldsObj, ticket);
  },
  actions: {
    /*
     * @method linkClick
     * closure action calls linkClick on controller
     * action is either 'post' or 'patch'
     */
    linkClick(link, ticket, model, action) {
      const fieldsObj = this.get('fieldsObj');
      this.get('linkClick')(link, ticket, model, action, fieldsObj);
    }
  }
});
