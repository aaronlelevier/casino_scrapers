import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Object.extend({
    store: inject('main'),
    third_party: Ember.computed(function() {
        const store = this.get('store'); 
        return store.find('third-party', this.get('id'));
    }),
    isDirtyOrRelatedDirty: Ember.computed('third_party.isDirtyOrRelatedDirty', function() {
        return this.get('third_party').get('isDirtyOrRelatedDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    status: Ember.computed(function() {
        const store = this.get('store');
        const third_party_status_list = store.find('general-status-list');
        return third_party_status_list.filter((tp) => {
            return Ember.$.inArray(this.get('id'), tp.get('third_parties')) > -1; 
        }).objectAt(0);
    })
});



