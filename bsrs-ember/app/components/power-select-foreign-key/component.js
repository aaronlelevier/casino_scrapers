import Ember from 'ember';
const { run, computed, defineProperty, inject } = Ember;

/*
 * API
 * - 'notTranslated'
 * - 'model'
 * - 'change_method'
 * - 'labelText'
 * - 'relatedModelName' - string that finds the related keys in simple store and used in class name
 * - 'valuePath'
 * - 'didValidate'
 * - 'selected'
*/
var PowerSelectFKComponent = Ember.Component.extend({
  simpleStore: inject.service(),
  displayName: 'name',
  init() {
    this._super(...arguments);
    const valuePath = this.get('valuePath');
    defineProperty(this, 'attributeValidation', computed.oneWay(`model.validations.attrs.${valuePath}`));
  },
  showMessage: computed('attributeValidation.isDirty', 'isInvalid', 'didValidate', function() {
    return (this.get('attributeValidation.isDirty') || this.get('didValidate')) && this.get('isInvalid');
  }),
  options: Ember.computed(function() {
    return this.get('simpleStore').find(this.get('relatedModelName'));
  }),
  isValid: computed.oneWay('attributeValidation.isValid'),
  isInvalid: computed.oneWay('attributeValidation.isInvalid'),
  actions: {
    selected(obj) {
      let change_method_name = this.get('change_method');
      run(() => {
        this.get('mainModel')[change_method_name](obj ? obj.get('id') : null);
      });
    }
  },
});

export default PowerSelectFKComponent;
