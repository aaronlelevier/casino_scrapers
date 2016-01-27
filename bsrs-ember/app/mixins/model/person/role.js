import Ember from 'ember';
import { belongs_to, change_belongs_to, belongs_to_dirty, belongs_to_rollback, belongs_to_save } from 'bsrs-components/attr/belongs-to';

var run = Ember.run;

var RoleMixin = Ember.Mixin.create({
    role: Ember.computed.alias('belongs_to.firstObject'),
    belongs_to: belongs_to('people', 'role'),
    change_role(new_role) {
        const old_role = this.get('role');
        const store = this.get('store');
        const person_id = this.get('id');
        const new_role_people = new_role.get('people') || [];
        //set people for role
        if(new_role.get('id')) {
            run(function() {
                store.push('role', {id: new_role.get('id'), people: new_role_people.concat([person_id])});
            });
            new_role.save();
        }
        if(old_role) {
            const old_role_people = old_role.get('people') || [];
            const updated_old_role_people = old_role_people.filter((old_role_person_pk) => {
                return old_role_person_pk !== person_id;
            });
            run(function() {
                store.push('role', {id: old_role.get('id'), people: updated_old_role_people});
            });
            old_role.save();
        }
        //remove person-locations that are part of the old role to ensure locationIsNotDirty
        const person_locations = this.get('person_locations');
        const person_location_ids = person_locations.mapBy('id');
        let person_location_fks = this.get('person_location_fks');
        run(function() {
            person_location_ids.forEach((id) => {
                store.push('person-location', {id: id, removed: true});
                let indx = person_location_fks.indexOf(id);
                person_location_fks.splice(indx, 1);
                store.push('person', {id: person_id, person_location_fks: person_location_fks});
            });
            //reset removed person-locations as a result of the new role set and update person_location_fks so locationIsNotDirty
            const all_person_locations = store.find('person-location');
            const matched_person_locations = all_person_locations.filter(function(join_model){
                return join_model.get('person_pk') === person_id;
            });
            matched_person_locations.forEach((person_location) => {
                const location = store.find('location', person_location.get('location_pk'));
                if (new_role.get('location_level_fk') === location.get('location_level').get('id')) {
                    store.push('person-location', {id: person_location.get('id'), removed: undefined});
                    person_location_fks.pushObject(person_location.get('id'));
                }
            });
        });
    },
    roleIsDirty: belongs_to_dirty('role_fk', 'role'),
    roleIsNotDirty: Ember.computed.not('roleIsDirty'),
    saveRole: belongs_to_save('person', 'role', 'role_fk'),
    rollbackRole: belongs_to_rollback('role_fk', 'role', 'rollbackChangeRole'),
    rollbackChangeRole: change_belongs_to('people', 'role'),
});

export default RoleMixin;
