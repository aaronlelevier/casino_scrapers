import Ember from 'ember';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import { add_many_to_many, many_to_many_rollback } from 'bsrs-components/attr/many-to-many';

const { run } = Ember;

var LocationMixin = Ember.Mixin.create({
  location_level_pk: Ember.computed('role.id', function() {
    const role = this.get('role');
    if(role && role.get('id')) {
      let location_level = role.get('location_level');
      return location_level ? location_level.get('id') : undefined;
    }
  }).readOnly(),
  /*
  * store push of a location from power select needs to setup llevel if change role
  */
  add_location(location) {
    // setup llevel w/ location
    const store = this.get('simpleStore');
    const location_store = store.push('location', location);
    location_store.change_location_level(location.location_level_fk);
    this.add_locations_container(location);
  },
  add_locations_container: add_many_to_many('locations', 'person'),
  saveLocations() {
    this.resetPersonLocationFks({save: true});
  },
  rollbackLocationsContainer: many_to_many_rollback('locations', 'person_locations', 'person'),
  rollbackLocations() {
    this.rollbackLocationsContainer();
    this.resetPersonLocationFks();
  },
  resetPersonLocationFks(options) {
    let saved_m2m_pks = [];
    const person_id = this.get('id');
    const store = this.get('simpleStore');
    const locations = this.get('locations');
    locations.forEach((location) => {
      if(options && options.save === true) {
        location.save();
      }
      const m2m_array = store.find('person-location').toArray();
      const m2m = m2m_array.filter(function(location_model, join_model) {
        const removed = join_model.get('removed');
        const person_pk = join_model.get('person_pk');
        const location_pk = join_model.get('location_pk');
        return person_pk === this.get('id') &&
          location_pk === location_model.get('id') && !removed;
      }.bind(this, location));
      m2m.forEach((join_model) => {
        saved_m2m_pks.push(join_model.get('id'));
      });
    });
    run(() => {
      store.push('person', {id: person_id, person_locations_fks: saved_m2m_pks});
    });
  }
});

export default LocationMixin;
