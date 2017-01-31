import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Object.extend({
  simpleStore: Ember.inject.service(),
  location: Ember.computed(function() {
    const store = this.get('simpleStore'); 
    return store.find('location', this.get('id'));
  }),
  isDirtyOrRelatedDirty: Ember.computed('location.isDirtyOrRelatedDirty', function() {
    return this.get('location').get('isDirtyOrRelatedDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  status_class: Ember.computed('status', function(){
    const name = this.get('status.name');
    return name ? name.replace(/\./g, '-') : '';
  }),
  location_level: Ember.computed(function() {
    const location_levels = this.get('simpleStore').find('location-level');
    return location_levels.filter((llevel) => {
      return llevel.get('id') === this.get('location_level_fk');
    }).objectAt(0);
  })
}); 

