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
    person_location_fks: previous(),
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
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'phoneNumbersIsDirty', 'addressesIsDirty', 'dirtyModel', 'roleIsDirty', 'locationsIsDirty', function() {
        return this.get('isDirty') || this.get('phoneNumbersIsDirty') || this.get('addressesIsDirty') || this.get('dirtyModel') || this.get('roleIsDirty') || this.get('locationsIsDirty');
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
    saveLocations: function() {
        this.resetPersonLocationFks({save: true});
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
        this.saveLocations();
    },
    rollbackRelated() {
        this.rollbackPhoneNumbers();
        this.rollbackAddresses();
        this.rollbackRole();
        this.rollbackLocations();
    },
    rollbackLocations() {
        let store = this.get('store');
        let locations = this.get('locations');
        let previous_m2m_fks = this.get('_prevState.person_location_fks') || [];

        let m2m_to_throw_out = store.find('person-location', function(join_model) {
            return Ember.$.inArray(join_model.get('id'), previous_m2m_fks) < 0 && !join_model.get('removed');
        }, ['removed']);

        m2m_to_throw_out.forEach(function(join_model) {
            join_model.set('removed', true);
        });

        previous_m2m_fks.forEach(function(pk) {
            var m2m_to_keep = store.find('person-location', pk);
            m2m_to_keep.set('removed', undefined);
        });

        this.resetPersonLocationFks();
    },
    resetPersonLocationFks(options) {
        let saved_m2m_pks = [];
        let store = this.get('store');
        let locations = this.get('locations');
        locations.forEach((location) => {
            if(options && options.save === true) {
                location.save();
            }
            let filter = function(location_model, join_model) {
                let removed = join_model.get('removed');
                let person_pk = join_model.get('person_pk');
                let location_pk = join_model.get('location_pk');
                return person_pk === this.get('id') &&
                    location_pk === location_model.get('id') && !removed;
            };
            let m2m = store.find('person-location', filter.bind(this, location), ['removed']);
            m2m.forEach(function(join_model) {
                saved_m2m_pks.push(join_model.get('id'));
            });
        });
        this.set('_prevState.person_location_fks', saved_m2m_pks);
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
    locationsIsNotDirty: Ember.computed.not('locationsIsDirty'),
    locationsIsDirty: Ember.computed('person_locations', 'locations.@each.isDirty', function() {
        let locations = this.get('locations');
        let previous_m2m_fks = this.get('_prevState.person_location_fks');
        if(locations.get('length') > 0) {
            if(!previous_m2m_fks || previous_m2m_fks.get('length') !== locations.get('length')) {
                return true;
            }

            let dirty_locations = locations.filter(function(location) {
                return location.get('isDirty') === true;
            });
            return dirty_locations.length > 0;
        }
        if(previous_m2m_fks && previous_m2m_fks.get('length') > 0) {
            return true;
        }
    }),
    person_locations: Ember.computed(function() {
        let store = this.get('store');
        let filter = function(join_model) {
            return join_model.get('person_pk') === this.get('id') && !join_model.get('removed');
        };
        return store.find('person-location', filter.bind(this), ['removed']);
    }),
    locations: Ember.computed('person_locations.[]', function() {
        let store = this.get('store');
        let person_locations = this.get('person_locations');
        let filter = function(location) {
            let location_pks = this.map(function(join_model) {
                return join_model.get('location_pk');
            });
            return Ember.$.inArray(location.get('id'), location_pks) > -1;
        };
        return store.find('location', filter.bind(person_locations), ['id']);
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
            auth_amount: this.get('auth_amount'),
            status: status_id,
            role: this.get('role').get('id'), //TODO: is this tested/used at all?
            emails: [],
            locations: [],
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
