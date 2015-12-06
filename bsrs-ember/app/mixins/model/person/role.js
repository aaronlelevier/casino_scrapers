import Ember from 'ember';

var RoleMixin = Ember.Mixin.create({
    role: Ember.computed.alias('belongs_to.firstObject'),
    belongs_to: Ember.computed(function() {
        let filter = function(role) {
            let people_pks = role.get('people') || [];
            return Ember.$.inArray(this.get('id'), people_pks) > -1;
        };
        return this.get('store').find('role', filter.bind(this), ['people']);
    }),
    change_role(new_role) {
        const old_role = this.get('role');
        const store = this.get('store');
        const person_id = this.get('id');
        const new_role_people = new_role.get('people') || [];
        //set people for role
        if(new_role.get('id')) {
            new_role.set('people', new_role_people.concat([person_id]));
            new_role.save();
        }
        if(old_role) {
            const old_role_people = old_role.get('people') || [];
            old_role.set('people', old_role_people.filter((old_role_person_pk) => {
                return old_role_person_pk !== person_id;
            }));
            old_role.save();
        }
        //remove person-locations that are part of the old role to ensure locationIsNotDirty
        const person_locations = this.get('person_locations');
        const person_location_ids = person_locations.mapBy('id');
        let person_location_fks = this.get('person_location_fks');
        person_location_ids.forEach((id) => {
            store.find('person-location', id).set('removed', true);
            let indx = person_location_fks.indexOf(id);
            person_location_fks.splice(indx, 1);
            this.set('person_location_fks', person_location_fks);
        });
        //reset removed person-locations as a result of the new role set and update person_location_fks so locationIsNotDirty
        const all_person_locations = store.find('person-location');
        all_person_locations.forEach((person_location) => {
            const location = store.find('location', person_location.get('location_pk')); 
            if (new_role.get('location_level_fk') === location.get('location_level').get('id')) {
                person_location.set('removed', undefined);
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
        var role = this.get('role');
        if(role) {
            role.save();
            this.set('role_fk', role.get('id'));
        }
    },
    rollbackRole() {
        var store = this.get('store');
        var previous_role_fk = this.get('role_fk');
        var current_role = this.get('role');
        if(current_role) {
            var current_role_people = current_role.get('people') || [];
            current_role.set('people', current_role_people.filter((old_role_person_pk) => {
                return old_role_person_pk !== this.get('id');
            }));
            current_role.save();
        }
        var new_role = store.find('role', previous_role_fk);
        if(new_role.get('id')) {
            var role_people = new_role.get('people') || [];
            new_role.set('people', role_people.concat([this.get('id')]));
            new_role.save();
        }
    },
});

export default RoleMixin;
