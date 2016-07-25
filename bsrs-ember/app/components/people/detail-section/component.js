import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import Base from 'bsrs-ember/components/mobile/base';

export default Base.extend({
  locationRepo: inject('location'),
  extra_params: Ember.computed(function() {
    const model = this.get('model');
    return { location_level: model.get('location_level_pk') };
  }),
});
