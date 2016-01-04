import Ember from 'ember';

var RoleMixin = Ember.Mixin.create({
    role: Ember.computed.alias('belongs_to.firstObject'),
    belongs_to: Ember.computed(function() {
        let pk = this.get('id');
        let filter = function(role) {
            let people_pks = role.get('people') || [];
            return Ember.$.inArray(pk, people_pks) > -1;
        };
        return this.get('store').find('role', filter);
    }),
    change_role(new_role) {
        const old_role = this.get('role');
        const store = this.get('store');
        const person_id = this.get('id');
        const new_role_people = new_role.get('people') || [];
        //set people for role
        if(new_role.get('id')) {
            store.push('role', {id: new_role.get('id'), people: new_role_people.concat([person_id])});
            new_role.save();
        }
        if(old_role) {
            const old_role_people = old_role.get('people') || [];
            const updated_old_role_people = old_role_people.filter((old_role_person_pk) => {
                return old_role_person_pk !== person_id;
            });
            store.push('role', {id: old_role.get('id'), people: updated_old_role_people});
            old_role.save();
        }
        //remove person-locations that are part of the old role to ensure locationIsNotDirty
        const person_locations = this.get('person_locations');
        const person_location_ids = person_locations.mapBy('id');
        let person_location_fks = this.get('person_location_fks');
        person_location_ids.forEach((id) => {
            store.push('person-location', {id: id, removed: true});
            let indx = person_location_fks.indexOf(id);
            person_location_fks.splice(indx, 1);
            store.push('person', {id: person_id, person_location_fks: person_location_fks});
        });
        //reset removed person-locations as a result of the new role set and update person_location_fks so locationIsNotDirty
        const all_person_locations = store.find('person-location');
        all_person_locations.forEach((person_location) => {
            const location = store.find('location', person_location.get('location_pk')); 
            if (new_role.get('location_level_fk') === location.get('location_level').get('id')) {
                store.push('person-location', {id: person_location.get('id'), removed: undefined});
                person_location_fks.pushObject(person_location.get('id'));
            }
        });
    },
    roleIsDirty: Ember.computed('belongs_to.[].isDirty', 'role_fk', function() {
        const role_id = this.get('role.id');
        const role_fk = this.get('role_fk');
        if(role_id) {
            return role_id === role_fk ? false : true;
        }
        if(!role_id && role_fk) {
            return true;
        }
    }),
    roleIsNotDirty: Ember.computed.not('roleIsDirty'),
    saveRole() {
        const pk = this.get('id');
        const store = this.get('store');
        const role = this.get('role');
        if(role) {
            role.save();
            store.push('person', {id: pk, role_fk: role.get('id')});
        }
    },
    rollbackRole() {
        var person_id = this.get('id');
        var store = this.get('store');
        var previous_role_fk = this.get('role_fk');
        var current_role = this.get('role');
        if(current_role) {
            var current_role_people = current_role.get('people') || [];
            var updated_current_role_people = current_role_people.filter((old_role_person_pk) => {
                return old_role_person_pk !== this.get('id');
            });
            store.push('role', {id: current_role.get('id'), people: updated_current_role_people});
            current_role.save();
        }
        var new_role = store.find('role', previous_role_fk);
        if(new_role.get('id')) {
            var role_people = new_role.get('people') || [];
            store.push('role', {id: new_role.get('id'), people: role_people.concat([person_id])});
            new_role.save();
        }
    },
});

export default RoleMixin;
