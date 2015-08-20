import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import loopAttrs from 'bsrs-ember/utilities/loop-attrs';
import previous from 'bsrs-ember/utilities/previous';

export default Model.extend({
    store: inject('main'),
    username: attr(''),
    first_name: attr(''),
    middle_initial: attr(''),
    last_name: attr(''),
    title: attr(''),
    employee_id: attr(''),
    auth_amount: attr(''),
    role_fk: previous(),
    location_fk: previous(),
    isModelDirty: false,
    dirtyModel: Ember.computed('isModelDirty', {
        get(key) {
            return this.isModelDirty;
        },
        set(key, value) {
            this.set('isModelDirty', value);
            return this.get('isModelDirty');
        }
    }),
    full_name: Ember.computed('first_name', 'last_name', function() {
        var first_name = this.get('first_name');
        var last_name = this.get('last_name');
        return first_name + ' ' + last_name;
    }),
    role: Ember.computed('role_property.[]', function() {
        var roles = this.get('role_property');
        var has_role = roles.get('length') > 0;
        var foreign_key = has_role ? roles.objectAt(0).get('id') : undefined;
        this.set('role_fk', foreign_key);
        if (has_role) {
            return roles.objectAt(0);
        }
    }),
    role_property: Ember.computed(function() {
        var store = this.get('store');
        var filter = function(role) {
            var people_pks = role.get('people') || [];
            if(Ember.$.inArray(this.get('id'), people_pks) > -1) {
                return true;
            }
            return false;
        };
        return store.find('role', filter.bind(this), ['people']);
    }),
    phone_numbers: Ember.computed(function() {
        var store = this.get('store');
        return store.find('phonenumber', {person: this.get('id')});
    }),
    addresses: Ember.computed(function() {
        var store = this.get('store');
        return store.find('address', {person: this.get('id')});
    }),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'phoneNumbersIsDirty', 'addressesIsDirty', 'dirtyModel', 'roleIsDirty', 'locationIsDirty', function() {
        return this.get('isDirty') || this.get('phoneNumbersIsDirty') || this.get('addressesIsDirty') || this.get('dirtyModel') || this.get('roleIsDirty') || this.get('locationIsDirty');
    }),
    roleIsDirty: Ember.computed('role_property.@each.isDirty', function() {
        let roles = this.get('role_property');
        var role = roles.objectAt(0);
        if(role) {
            return role.get('isDirty');
        }
        return this.get('_prevState.role_fk') ? true : false;
    }),
    roleIsNotDirty: Ember.computed.not('roleIsDirty'),
    phoneNumbersIsDirty: Ember.computed('phone_numbers.@each.isDirty', 'phone_numbers.@each.number', 'phone_numbers.@each.type', function() {
        var phone_numbers = this.get('phone_numbers');
        var phone_number_dirty = false;
        phone_numbers.forEach((num) => {
            if (num.get('isDirty')) {
                phone_number_dirty = true;
            }
        });
        return phone_number_dirty;
    }),
    phoneNumbersIsNotDirty: Ember.computed.not('phoneNumbersIsDirty'),
    addressesIsDirty: Ember.computed('addresses.@each.isDirty', 'addresses.@each.address', 'addresses.@each.city', 'addresses.@each.state',
                                     'addresses.@each.postal_code', 'addresses.@each.country', 'addresses.@each.type', function() {
        var addresses = this.get('addresses');
        var address_dirty = false;
        addresses.forEach((address) => {
            if (address.get('isDirty')) {
                address_dirty = true;
            }
        });
        return address_dirty;
    }),
    addressesIsNotDirty: Ember.computed.not('addressesIsDirty'),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    savePhoneNumbers: function() {
        var phone_numbers = this.get('phone_numbers');
        phone_numbers.forEach((num) => {
            num.save();
        });
    },
    saveAddresses: function() {
        var addresses = this.get('addresses');
        addresses.forEach((address) => {
            address.save();
        });
    },
    saveLocation: function() {
        var location = this.get('location');
        if(location) {
            location.save();
        }
    },
    saveRole: function() {
        var role = this.get('role');
        if(role) {
            role.save();
        }
    },
    saveRelated() {
        this.savePhoneNumbers();
        this.saveAddresses();
        this.saveRole();
    },
    rollbackRelated() {
        this.rollbackPhoneNumbers();
        this.rollbackAddresses();
        this.rollbackRole();
    },
    rollbackRole() {
        var store = this.get('store');
        var previous_role_fk = this.get('_prevState.role_fk');

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
    rollbackLocation() {
        var store = this.get('store');
        var previous_location_fk = this.get('_prevState.location_fk');

        var current_location = this.get('location');
        if(current_location) {
            var current_location_people = current_location.get('people') || [];
            current_location.set('people', current_location_people.filter((old_location_person_pk) => {
                return old_location_person_pk !== this.get('id');
            }));
        }

        var new_location = store.find('location', previous_location_fk);
        if(new_location.get('id')) {
            var location_people = new_location.get('people') || [];
            new_location.set('people', location_people.concat([this.get('id')]));
            new_location.save();
        }
    },
    rollbackPhoneNumbers() {
        var phone_numbers = this.get('phone_numbers');
        phone_numbers.forEach((num) => {
            num.rollback();
        });
    },
    rollbackAddresses() {
        var addresses = this.get('addresses');
        addresses.forEach((address) => {
            address.rollback();
        });
    },
    locationIsDirty: Ember.computed('locations.@each.isDirty', function() {
        let locations = this.get('locations');
        var location = locations.objectAt(0);
        if(location) {
            return location.get('isDirty');
        }
        return this.get('_prevState.location_fk') ? true : false;
    }),
    locationIsNotDirty: Ember.computed.not('locationIsDirty'),
    location: Ember.computed('locations.[]', function() {
        var locations = this.get('locations');
        var has_location = locations.get('length') > 0;
        var foreign_key = has_location ? locations.objectAt(0).get('id') : undefined;
        this.set('location_fk', foreign_key);
        if(has_location) {
            return locations.objectAt(0);
        }
    }),
    locations: Ember.computed(function() {
        var store = this.get('store');
        var filter = function(location) {
            var people_pks = location.get('people') || [];
            if(Ember.$.inArray(this.get('id'), people_pks) > -1) {
                return true;
            }
            return false;
        };
        return store.find('location', filter.bind(this), ['people']);
    }),
    createSerialize() {
        return {
            id: this.get('id'),
            username: this.get('username'),
            password: this.get('password'),
            role: this.get('role').get('id')
        };
    },
    serialize() {
        //TODO: remove this hard reference to get the first status
        var store = this.get('store');
        var status_id = store.findOne('status').get('id');
        var phone_numbers = this.get('phone_numbers').map(function(number) {
            return number.serialize();
        });
        var addresses = this.get('addresses').map(function(address) {
            return address.serialize();
        });
        return {
            id: this.get('id'),
            username: this.get('username'),
            password: this.get('password'),
            first_name: this.get('first_name'),
            middle_initial: this.get('middle_initial'),
            last_name: this.get('last_name'),
            title: this.get('title'),
            employee_id: this.get('employee_id'),
            location:'',
            auth_amount: this.get('auth_amount'),
            status: status_id,
            role: this.get('role').get('id'), //TODO: is this tested/used at all?
            emails: [],
            phone_numbers: phone_numbers,
            addresses: addresses
        };
    },
    removeRecord() {
        this.get('store').remove('person', this.get('id'));
    },
    isNew: Ember.computed(function() {
        return loopAttrs(this);
    })
});
