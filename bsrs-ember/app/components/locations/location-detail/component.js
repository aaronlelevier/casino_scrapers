import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';
import RelaxedMixin from 'bsrs-ember/mixins/validation/relaxed';
import { task } from 'ember-concurrency';

var LocationSingle = ParentValidationComponent.extend(RelaxedMixin, TabMixin, {
  repository: inject('location'),
  child_components: ['input-multi-phone', 'input-multi-address', 'input-multi-email'],
  classNames: ['wrapper', 'form'],
  nameValidation: validate('model.name'),
  numberValidation: validate('model.number'),
  statusValidation: validate('model.status'),
  locationLevelValidation: validate('model.location_level'),
  isDisabled: Ember.computed('model.location_level', function() {
    if(this.get('model').get('new') && !this.get('model').get('location_level')){
      return true;
    }
    return false;
  }),
  saveTask: task(function * () {
    this.set('submitted', true);
    if (this.all_components_valid()) {
      const tab = this.tab();
      yield this.get('save')(tab);
    }
  }),
  extra_params: Ember.computed(function(){
    const llevel = this.get('model.location_level.id') ? this.get('model.location_level.id') : this.get('model.top_location_level.id');
    const pk = this.get('model').get('id');
    return {llevel, pk};
  }),
  actions: {
    save() {
      this.get('saveTask').perform();
    },
  }
});

export default LocationSingle;
