import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend({
  repository: inject('location'),
  extra_params: Ember.computed('model.location_level', function() {
    const llevel = this.get('model.location_level.id') ? this.get('model.location_level.id') : this.get('model.top_location_level.id');
    const pk = this.get('model').get('id');
    return {llevel, pk};
  }),
});
