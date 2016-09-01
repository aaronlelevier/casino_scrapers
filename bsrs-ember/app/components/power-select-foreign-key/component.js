import Ember from 'ember';
const { run, computed, defineProperty } = Ember;

/*
 * API
 * - 'notTranslated'
 * - 'model'
 * - 'change_method'
 * - 'labelText'
 * - 'relatedModelName'
 * - 'relatedModels'
 * - 'valuePath'
 * - 'didValidate'
 * - 'selected'
*/
var PowerSelectFKComponent = Ember.Component.extend({
  displayName: 'name',
  init() {
    this._super(...arguments);
    const valuePath = this.get('valuePath');
    defineProperty(this, 'attributeValidation', computed.oneWay(`model.validations.attrs.${valuePath}`));
  },
  showMessage: computed('attributeValidation.isDirty', 'isInvalid', 'didValidate', function() {
    return (this.get('attributeValidation.isDirty') || this.get('didValidate')) && this.get('isInvalid');
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
