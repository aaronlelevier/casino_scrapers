import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import LocationLevelMixin from 'bsrs-ember/mixins/model/location/location-level';

export default Ember.Object.extend(LocationLevelMixin, {
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
}); 

