import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import ChangeBoolMixin from 'bsrs-ember/mixins/components/change-bool';

var RoleSingle = Ember.Component.extend(TabMixin, EditMixin, ValidationMixin, {
  repository: inject('role'),
  nameValidation: validate('model.name'),
  locationLevelValidation: validate('model.location_level'),
  actions: {
    save() {
      this.set('submitted', true);
      if (this.get('valid')) {
        this._super();
      }
    },
    changedLocLevel(model, val) {
      model.set('location_level', val);
    },
  }
});

export default RoleSingle;
