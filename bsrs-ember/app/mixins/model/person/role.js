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
        //cleanup person_locations in order to cleanup locations for person-locations-select component
        let person_locations = this.get('person_locations');
        person_locations.forEach((person_location) => {
            person_location.set('removed', true);
        });
    },
    roleIsDirty: Ember.computed('role_property.@each.isDirty', function() {
        let roles = this.get('role_property');
        let role = roles.objectAt(0);
        if(role) {
            return role.get('isDirty');
        }
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
