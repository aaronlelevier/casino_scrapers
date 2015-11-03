import Ember from 'ember';

var RequesterMixin = Ember.Mixin.create({
    requester: Ember.computed(function() {
        let requester_id = this.get('requester_id');
        let filter = function(person) {
            return person.get('id') === requester_id; 
        };
        let person = this.get('store').find('person', filter, []);
        return person.objectAt(0);
    }),
    requesterIsDirty: Ember.computed('requester.id', function() {
        let requester_id = this.get('_oldState').requester;
        let requester = this.get('requester_id');
        if(requester_id) { 
            return requester_id !== requester; 
        }
        return false;
    }),
    change_requester(people_id) {
       this.set('requester_id', people_id); 
    }
});

export default RequesterMixin;

