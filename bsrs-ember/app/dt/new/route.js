import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

let DTNewRoute = Ember.Route.extend({
  locationRepo: inject('location'),
  ticketRepository: inject('ticket'),
  personCurrent: Ember.inject.service('person-current'),
  model(params) {
    const new_pk = parseInt(params.new_id, 10);
    let person = this.get('personCurrent').get('model').get('person');
    let disabled = !person.get('has_multi_locations');
    let ticket;
    let defaultLocation = person.get('locations').objectAt(0);
    if (disabled) {
      ticket = this.get('ticketRepository').create(new_pk, {
        location_fk: defaultLocation.get('id')
      });
      ticket.change_location({id: defaultLocation.get('id')});
    } else {
      ticket = this.get('ticketRepository').create(new_pk);
    }
    return {
      ticket: ticket,
      personCurrent: person,
      locationRepo: this.get('locationRepo'),
      disabled: disabled,
      selected: disabled ? defaultLocation : null
    };
  },
  setupController: function(controller, hash) {
    controller.set('ticket', hash.ticket);
    controller.set('personCurrent', hash.personCurrent);
    controller.set('locationRepo', hash.locationRepo);
    controller.set('disabled', hash.disabled);
    controller.set('selected', hash.selected);
  },
});

export default DTNewRoute;
