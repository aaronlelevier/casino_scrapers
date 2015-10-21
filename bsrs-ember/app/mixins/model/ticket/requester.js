import Ember from 'ember';

var RequesterMixin = Ember.Mixin.create({
    requester_id: '',
    requester: Ember.computed('requester_id', function() {
        let requester_id = this.get('requester_id');
        let filter = function(person) {
            return person.get('id') === requester_id; 
        };
        let person = this.get('store').find('person', filter, []);
        return person.objectAt(0);
    }),
    requesterIsDirty: Ember.computed('requester.id', function() {
        let requester_id = this.get('requester_id');
        let requester = this.get('requester');
        if(requester_id && requester.get('id')) { 
            return requester_id !== requester.get('id'); 
        }
        return false;
    })
});

export default RequesterMixin;

