import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';
import prevent_duplicate_name from 'bsrs-ember/validation/prevent_duplicate_name';

var LocationLevelGeneral = Ember.Component.extend(TabMixin, ValidationMixin, {
  repository: inject('location-level'),
  classNames: ['wrapper', 'form'],
  nameValidation: validate('model.name', prevent_duplicate_name),
  actions: {
    save() {
      this.set('submitted', true);
      if (this.get('valid')) {
        const tab = this.tab();
        return this.get('save')(tab);
      }
    },
  }
});

export default LocationLevelGeneral;
