import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import { task } from 'ember-concurrency';

var LocationSingle = Ember.Component.extend(TabMixin, {
  repository: inject('location'),
  disabled: Ember.computed('model.location_level', function() {
    if(this.get('model').get('new') && !this.get('model').get('location_level')){
      return true;
    }
    return false;
  }),
  saveTask: task(function * () {
    if (this.get('model.validations.isValid')) {
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
