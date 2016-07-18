import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';
import prevent_duplicate_name from 'bsrs-ember/validation/prevent_duplicate_name';

var LocationLevelGeneral = Ember.Component.extend(TabMixin, EditMixin, ValidationMixin, {
  repository: inject('location-level'),
  classNames: ['wrapper', 'form'],
  nameValidation: validate('model.name', prevent_duplicate_name),
  actions: {
    save() {
      this.set('submitted', true);
      if (this.get('valid')) {
        this._super(...arguments);
      }
    },
  }
});

export default LocationLevelGeneral;
