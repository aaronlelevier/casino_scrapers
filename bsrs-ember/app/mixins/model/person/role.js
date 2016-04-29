import Ember from 'ember';
import { change_belongs_to_fk } from 'bsrs-components/attr/belongs-to';

const { run } = Ember;

var RoleMixin = Ember.Mixin.create({
  change_role(new_role) {
    const old_role = this.get('role');
    const store = this.get('simpleStore');
    const person_id = this.get('id');
    const new_role_people = new_role.get('people') || [];
    //set people for role
    if(new_role.get('id')) {
      run(() => {
        //TODO: test uniq
        new_role = store.push('role', {id: new_role.get('id'), people: new_role_people.concat([person_id]).uniq()});
        new_role.save();
      });
    }
    //TODO: test this if statement
    if(typeof old_role === 'object' && old_role.get('id') !== new_role.get('id')) {
      const old_role_people = old_role.get('people') || [];
      const updated_old_role_people = old_role_people.filter((old_role_person_pk) => {
        return old_role_person_pk !== person_id;
      });
      run(() => {
        store.push('role', {id: old_role.get('id'), people: updated_old_role_people});
      });
      old_role.save();
    }
    //remove person-locations that are part of the old role to ensure locationIsNotDirty
    const person_locations = this.get('person_locations');
    const person_location_ids = person_locations.mapBy('id');
    let person_locations_fks = this.get('person_locations_fks');
    person_location_ids.forEach((id) => {
      let indx = person_locations_fks.indexOf(id);
      person_locations_fks.splice(indx, 1);
      run(() => {
        store.push('person', {id: person_id, person_locations_fks: person_locations_fks});
        store.push('person-location', {id: id, removed: true});
      });
    });
    //reset removed person-locations as a result of the new role set and update person_locations_fks so locationIsNotDirty
    const all_person_locations = store.find('person-location');
    const matched_person_locations = all_person_locations.filter((join_model) => {
      return join_model.get('person_pk') === person_id;
    });
    matched_person_locations.forEach((person_location) => {
      const location = store.find('location', person_location.get('location_pk'));
      if (new_role.get('location_level_fk') === location.get('location_level').get('id')) {
        run(() => {
          store.push('person-location', {id: person_location.get('id'), removed: undefined});
        });
        person_locations_fks.pushObject(person_location.get('id'));
      }
    });
  },
  rollbackRole() {
    const role_fk = this.get('role_fk');
    this.rollbackChangeRole(role_fk);
  },
  rollbackChangeRole: change_belongs_to_fk('role'),
});

export default RoleMixin;
