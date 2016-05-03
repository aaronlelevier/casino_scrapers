import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import RelaxedMixin from 'bsrs-ember/mixins/validation/relaxed';

function validatePassword(){
  if(this.changingPassword && this.get('model.password').length > 0){
    return true;
  }else if(!this.changingPassword){
    return true;
  }
}
// function validateSingleChar(middle_init){
//   if(middle_init) {
//     return middle_init.length < 2 ? true : false;
//   }
//   return true;
// }

var PersonSingle = ParentValidationComponent.extend(RelaxedMixin, TabMixin, EditMixin, {
  didValidate: false,
  repository: inject('person'),
  locationRepo: inject('location'),
  child_components: ['input-multi-phone', 'input-multi-address', 'input-multi-email'],
  classNames: ['wrapper', 'form'],
  //TODO: what is this used for?
  attemptedTransition: '',
  passwordValidation: validate('model.password', validatePassword),
  changingPassword: false,
  extra_params: Ember.computed(function(){
    const model = this.get('model');
    return {location_level: model.get('location_level_pk')};
  }),
  actions: {
    save() {
      this.set('submitted', true);
      if (this.all_components_valid()) {
        if (this.get('model.validations.isValid')) {
          this._super();
        }
        this.set('didValidate', true);
      }
    },
    localeChanged(locale){
      this.sendAction('localeChanged', locale);
    },
    changePassword(){
      this.toggleProperty('changingPassword');
      this.get('model').clearPassword();
    }
  }
});

export default PersonSingle;
