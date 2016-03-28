import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Object.extend({
  store: inject('main'),
  location: Ember.computed(function() {
    const store = this.get('store'); 
    return store.find('location', this.get('id'));
  }),
  isDirtyOrRelatedDirty: Ember.computed('location.isDirtyOrRelatedDirty', function() {
    return this.get('location').get('isDirtyOrRelatedDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  status: Ember.computed(function() {
    const store = this.get('store');
    const location_status_list = store.find('location-status-list');
    return location_status_list.filter((ls) => {
      return Ember.$.inArray(this.get('id'), ls.get('locations')) > -1; 
    }).objectAt(0);
  }),
  status_class: Ember.computed('status', function(){
    const name = this.get('status.name');
    return name ? name.replace(/\./g, '-') : '';
  }),
  location_level: Ember.computed(function() {
    const store = this.get('store'); 
    const pk = this.get('id');
    const location_levels = store.find('location-level');
    return location_levels.filter((llevel) => {
      const location_pks = llevel.get('locations') || [];
      return Ember.$.inArray(pk, location_pks) > -1;
    }).objectAt(0);
  })
}); 

