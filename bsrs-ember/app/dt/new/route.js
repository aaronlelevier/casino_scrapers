import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var DTNewRoute = Ember.Route.extend({
    locationRepo: inject('location'),
    ticketRepository: inject('ticket'),
    personCurrent: Ember.inject.service(),
    model(params) {
        const new_pk = parseInt(params.new_id, 10);
        let ticket = this.get('ticketRepository').create(new_pk);
        let person = this.get('personCurrent').get('model');
        return {
            ticket: ticket,
            personCurrent: person,
            locationRepo: this.get('locationRepo'),
            disabled: !person.get('has_multi_locations'), // if User doesn't have multi, then disable
            options: person.get('location'),
            selected: person.get('locations') ? person.get('locations').objectAt(0) : null 
        };
    }
});

export default DTNewRoute;