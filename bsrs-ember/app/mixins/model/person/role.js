import Ember from 'ember';

var RoleMixin = Ember.Mixin.create({
    role: Ember.computed('role_property.[]', function() {
        let roles = this.get('role_property');
        return roles.get('length') > 0 ? roles.objectAt(0) : undefined;
    }),
    role_property: Ember.computed(function() {
        let store = this.get('store');
        let filter = function(role) {
            let people_pks = role.get('people') || [];
            return Ember.$.inArray(this.get('id'), people_pks) > -1;
        };
        return store.find('role', filter.bind(this), ['people']);
    }),
    change_role(new_role, old_role) {
        let store = this.get('store');
        let person_id = this.get('id');
        let new_role_people = new_role.get('people') || [];
        if(new_role.get('id')) {
            new_role.set('people', new_role_people.concat([person_id]));
        }
        if(old_role) {
            let old_role_people = old_role.get('people') || [];
            old_role.set('people', old_role_people.filter((old_role_person_pk) => {
                return old_role_person_pk !== person_id;
            }));
            old_role.save();
        }
        //remove person-locations that are part of the old role
        let person_locations = this.get('person_locations');
        let person_location_ids = person_locations.map((person_location) => {
            return person_location.get('id');
        });
        person_location_ids.forEach((id) => {
            store.find('person-location', id).set('removed', true);
            let person_location_fks = this.get('person_location_fks');
            let indx = person_location_fks.indexOf(id);
            person_location_fks.splice(indx, 1);
            this.set('person_location_fks', person_location_fks);
        });
        //reset removed person-locations as a result of the new role set.
        let all_person_locations = store.find('person-location');
        all_person_locations.forEach((person_location) => {
            let location = store.find('location', person_location.get('location_pk')); 
            if (new_role.get('location_level_fk') === location.get('location_level').get('id')) {
                person_location.set('removed', undefined);
            }
        });
        //setup role_fk for rollback. role_fk is used for dirty tracking. check for old role on person new template
        if (old_role) { 
            this.set('role_fk', old_role.get('id')); }
    },
    roleIsDirty: Ember.computed('role_property.@each.isDirty', 'role_fk', function() {
        let roles = this.get('role_property');
        let role = roles.objectAt(0);
        let rollback_fk = this.get('role_fk');
        //role_fk is updated and serialized in the person so need new way to check if dirty
        if(role) {
            if (rollback_fk && rollback_fk !== role.get('id')) {
                return true;
            }
            return role.get('isDirty');
        }
        //if new person
        return this.get('role_fk') ? true : false;
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
