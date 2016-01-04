import Ember from 'ember';

var run = Ember.run;

var RequesterMixin = Ember.Mixin.create({
    requester: Ember.computed(function() {
        let requester_id = this.get('requester_id');
        let filter = function(person) {
            return person.get('id') === requester_id;
        };
        let person = this.get('store').find('person', filter);
        return person.objectAt(0); //TODO: this will not recomputed correctly (should be an alias to do firstObject)
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
        const store = this.get('store');
        const ticket_pk = this.get('id');
        run(function() {
            store.push('ticket', {id: ticket_pk, requester_id: people_id});
        });
    }
});

export default RequesterMixin;
