import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import RoleMixin from 'bsrs-ember/mixins/model/person/role';

export default Ember.Object.extend(RoleMixin, {
    store: inject('main'),
    person: Ember.computed(function() {
        const store = this.get('store'); 
        return store.find('person', this.get('id'));
    }),
    isDirtyOrRelatedDirty: Ember.computed('person.isDirtyOrRelatedDirty', function() {
        return this.get('person').get('isDirtyOrRelatedDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    fullname: Ember.computed('first_name', 'last_name', function() {
        const first_name = this.get('first_name');
        const last_name = this.get('last_name');
        return first_name + ' ' + last_name;
    }),
    status: Ember.computed(function() {
        const store = this.get('store');
        const person_status_list = store.find('person-status-list');
        return person_status_list.filter((ps) => {
            return Ember.$.inArray(this.get('id'), ps.get('people')) > -1; 
        }).objectAt(0);
    }),
    status_class: Ember.computed('status', function(){
        const name = this.get('status.name');
        return name ? name.replace(/\./g, '-') : '';
    }),
}); 

