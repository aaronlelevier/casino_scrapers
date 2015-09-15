import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import NewMixin from 'bsrs-ember/mixins/model/new';
import CopyMixin from 'bsrs-ember/mixins/model/copy';

var Person = Model.extend(NewMixin, CopyMixin, {
    uuid: injectUUID('uuid'),
    store: inject('main'),
    username: attr(''),
    first_name: attr(''),
    middle_initial: attr(''),
    last_name: attr(''),
    title: attr(''),
    employee_id: attr(''),
    auth_amount: attr(''),
    locale: attr(''),
    role_fk: undefined,
    phone_number_fks: [],
    address_fks: [],
    person_location_fks: [],
    isModelDirty: false,
    fullname: Ember.computed('first_name', 'last_name', function() {
        var first_name = this.get('first_name');
        var last_name = this.get('last_name');
        return first_name + ' ' + last_name;
    }),
    role: Ember.computed('role_property.[]', function() {
        var roles = this.get('role_property');
        return roles.get('length') > 0 ? roles.objectAt(0) : undefined;
    }),
    role_property: Ember.computed(function() {
        var store = this.get('store');
        var filter = function(role) {
            var people_pks = role.get('people') || [];
            return Ember.$.inArray(this.get('id'), people_pks) > -1;
        };
        return store.find('role', filter.bind(this), ['people']);
    }),
    phone_numbers_all: Ember.computed(function() {
        var store = this.get('store');
        var filter = function(phone_number) {
            return this.get('id') === phone_number.get('person_fk');
        };
        return store.find('phonenumber', filter.bind(this), ['removed']);
    }),
    phone_numbers: Ember.computed(function() {
        var store = this.get('store');
        var filter = function(phone_number) {
            return this.get('id') === phone_number.get('person_fk') && !phone_number.get('removed');
        };
        return store.find('phonenumber', filter.bind(this), ['removed']);
    }),
    phone_number_ids: Ember.computed('phone_numbers.[]', function() {
        return this.get('phone_numbers').map((ph_num) => {
            return ph_num.get('id');
        });
    }),
    addresses_all: Ember.computed(function() {
        var store = this.get('store');
        var filter = function(address) {
            return this.get('id') === address.get('person_fk');
        };
        return store.find('address', filter.bind(this), ['removed']);
    }),
    addresses: Ember.computed(function() {
        var store = this.get('store');
        var filter = function(address) {
            return this.get('id') === address.get('person_fk') && !address.get('removed');
        };
        return store.find('address', filter.bind(this), ['removed']);
    }),
    address_ids: Ember.computed('addresses.[]', function() {
        return this.get('addresses').map((address) => {
            return address.get('id');
        });
    }),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'phoneNumbersIsDirty', 'addressesIsDirty', 'roleIsDirty', 'locationsIsDirty', function() {
        return this.get('isDirty') || this.get('phoneNumbersIsDirty') || this.get('addressesIsDirty') || this.get('roleIsDirty') || this.get('locationsIsDirty');
    }),
    roleIsDirty: Ember.computed('role_property.@each.isDirty', function() {
        let roles = this.get('role_property');
        var role = roles.objectAt(0);
        if(role) {
            return role.get('isDirty');
        }
        return this.get('role_fk') ? true : false;
    }),
    roleIsNotDirty: Ember.computed.not('roleIsDirty'),
    phoneNumbersIsDirty: Ember.computed('phone_numbers.@each.isDirty', 'phone_numbers.@each.number', 'phone_numbers.@each.type', function() {
        let phone_number_dirty = false;
        let phone_numbers = this.get('phone_numbers');
        let phone_fks = this.get('phone_number_fks');
        let filtered_phone_numbers = phone_numbers.map((phone_number) => {
            return this.copy(phone_number);
        });
        let filtered_phone_fks = Ember.$.extend(true, [], phone_fks);
        if (filtered_phone_fks.length < filtered_phone_numbers.length) {
            //if add new phone number and ask right away if dirty, need to update fk array
            phone_numbers.forEach((phone_number) => {
                if (Ember.$.inArray(phone_number.get('id'), filtered_phone_fks) < 0) {
                    filtered_phone_fks.push(phone_number.get('id'));
                }
            });
        }
        phone_numbers.forEach((num) => {
            //if dirty
            if (num.get('isDirty')) {
                phone_number_dirty = true;
            }
            //get rid of invalid numbers and provide updated array for dirty check; only if off by one.  If same length, then don't want to filter out.
            if (num.get('invalid_number') && filtered_phone_fks.length !== filtered_phone_numbers.length) {
                filtered_phone_fks = filtered_phone_fks.filter((fk) => {
                        return fk !== num.get('id');
                });
                filtered_phone_numbers = filtered_phone_numbers.filter((phone_number) => {
                    return phone_number.number !== '' || phone_number.number !== 'undefined';
                });
            }
        });
        //if not dirty, but delete phone number, then mark as dirty and clean up array
        if (this.get('phone_numbers_all').get('length') > 0 && filtered_phone_fks.length !== filtered_phone_numbers.length) {
            phone_number_dirty = true;
        }
        return phone_number_dirty;
    }),
    phoneNumbersIsNotDirty: Ember.computed.not('phoneNumbersIsDirty'),
    addressesIsDirty: Ember.computed('addresses.@each.isDirty', 'addresses.@each.address', 'addresses.@each.city', 'addresses.@each.state',
                                     'addresses.@each.postal_code', 'addresses.@each.country', 'addresses.@each.type', function() {
        var address_dirty = false;
        var addresses = this.get('addresses');
        var address_fks = this.get('address_fks');
        let filtered_addresses = addresses.map((address) => {
            return this.copy(address);
        });
        let filtered_address_fks = Ember.$.extend(true, [], address_fks);
        if (filtered_address_fks.length < addresses.get('length')) {
            addresses.forEach((address) => {
                if (Ember.$.inArray(address.get('id'), filtered_address_fks) < 0) {
                    filtered_address_fks.push(address.get('id'));
                }
            });
        }
        addresses.forEach((address) => {
            if (address.get('isDirty')) {
                address_dirty = true;
            }
            if (address.get('invalid_address') && filtered_address_fks.length !== filtered_addresses.length) {
                filtered_address_fks = filtered_address_fks.filter((fk) => {
                    return fk !== address.get('id');
                }); 
                filtered_addresses = filtered_addresses.filter((address) => {
                    return address.address !== '' || address.address !== 'undefined';
                });
            }
        });
        if (this.get('addresses_all').get('length') > 0 && filtered_address_fks.length !== filtered_addresses.length) {
            address_dirty = true;
        }
        return address_dirty;
    }),
    addressesIsNotDirty: Ember.computed.not('addressesIsDirty'),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    cleanupPhoneNumbers: function() {
        let store = this.get('store');
        let phone_numbers_to_remove = [];
        let phone_numbers = this.get('phone_numbers');
        let phone_numbers_all = this.get('phone_numbers_all');
        let phone_fks = this.get('phone_number_fks');
        let phone_number_ids = this.get('phone_number_ids');
        phone_numbers_all.forEach((num) => {//TODO: write test for this
            if(num.get('invalid_number') || num.get('removed')) {
                phone_numbers_to_remove.push(num.get('id'));
            }
        });
        phone_numbers_to_remove.forEach((id) => {
            store.remove('phonenumber', id);
        });
        this.cleanupPhoneNumberFKs();
    },
    cleanupPhoneNumberFKs: function() {
        let phone_fks = this.get('phone_number_fks');
        let phone_number_ids = this.get('phone_number_ids');
        //add
        phone_number_ids.forEach((id) => {
            if (Ember.$.inArray(id, phone_fks) < 0) {
                phone_fks.push(id);
            }
        });
        //remove
        phone_fks.forEach((fk, indx) => {
            if (phone_number_ids.indexOf(fk) < 0) {
               phone_fks.splice(indx, 1); 
            }
        });
    },
    savePhoneNumbers: function() {
        this.cleanupPhoneNumberFKs();//SCOTT: put this after so don't have to call again in cleanupPhoneNumber?
        this.cleanupPhoneNumbers();
        let phone_numbers = this.get('phone_numbers');
        phone_numbers.forEach((num) => {
            num.save();
        });
    },
    saveAddresses: function() {
        this.cleanupAddressFKs();//SCOTT: put this after so don't have to call again in cleanupPhoneNumber?
        this.cleanupAddresses();
        let addresses = this.get('addresses');
        addresses.forEach((address) => {
            address.save();
        });
    },
    cleanupAddresses: function() {
        let store = this.get('store');
        let addresses_to_remove = [];
        let addresses = this.get('addresses');
        let addresses_all = this.get('addresses_all');
        let address_fks = this.get('address_fks');
        let address_ids = this.get('address_ids');
        addresses_all.forEach((address) => {
            if(address.get('invalid_address') || address.get('removed')) {
                addresses_to_remove.push(address.get('id'));
            }
        });
        addresses_to_remove.forEach((id) => {
            store.remove('address', id);
        });
        this.cleanupAddressFKs();
    },
    cleanupAddressFKs: function() {
        let address_fks = this.get('address_fks');
        let address_ids = this.get('address_ids');
        //add
        address_ids.forEach((id) => {
            if (Ember.$.inArray(id, address_fks) < 0) {
                address_fks.push(id);
            }
        });
        //remove
        address_fks.forEach((fk, indx) => {
            if (address_ids.indexOf(fk) < 0) {
               address_fks.splice(indx, 1); 
            }
        });
    },
    saveLocations: function() {
        this.resetPersonLocationFks({save: true});
    },
    saveRole: function() {
        var role = this.get('role');
        if(role) {
            role.save();
            this.set('role_fk', role.get('id'));
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
        let previous_m2m_fks = this.get('person_location_fks');

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
        this.set('person_location_fks', saved_m2m_pks);
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
    rollbackPhoneNumbers() {
        let store = this.get('store');
        let phone_numbers_to_remove = [];
        let phone_numbers = this.get('phone_numbers_all');
        phone_numbers.forEach((num) => {
            //rollback scenario
            if (num.get('removed')) {
                num.set('removed', undefined);
            }
            if(num.get('invalid_number') && num.get('isNotDirty')) {
                phone_numbers_to_remove.push(num.get('id'));
            }
            num.rollback();
        });
        phone_numbers_to_remove.forEach((id) => {
            store.remove('phonenumber', id);
        });
    },
    rollbackAddresses() {
        let store = this.get('store');
        let addresses_to_remove = [];
        let addresses = this.get('addresses_all');
        addresses.forEach((address) => {
            if (address.get('removed')) {
                address.set('removed', undefined);
            }
            if(address.get('invalid_address') && address.get('isNotDirty')) {
                addresses_to_remove.push(address.get('id'));
            }
            address.rollback();
        });
        addresses_to_remove.forEach((id) => {
            store.remove('address', id);
        });
    },
    locationsIsNotDirty: Ember.computed.not('locationsIsDirty'),
    locationsIsDirty: Ember.computed('person_locations', 'locations.@each.isDirty', function() {
        let locations = this.get('locations');
        let previous_m2m_fks = this.get('person_location_fks');
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
    remove_location(location_pk) {
        let store = this.get('store');
        if(Ember.$.inArray(location_pk, this.get('location_ids')) > -1) {
            let m2m_pk = this.get('person_locations').filter((m2m) => {
                return m2m.get('location_pk') === location_pk;
            }).objectAt(0).get('id');
            store.push('person-location', {id: m2m_pk, removed: true});
        }
    },
    add_locations(location_pk) {
        let store = this.get('store');
        let uuid = this.get('uuid');
        store.push('person-location', {id: uuid.v4(), person_pk: this.get('id'), location_pk: location_pk});
    },
    change_role(new_role, old_role) {
        let person_id = this.get('id');
        let new_role_people = new_role.get('people') || [];
        if(new_role.get('id')) {
            new_role.set('people', new_role_people.concat([person_id]));
        }
        if(old_role) {
            var old_role_people = old_role.get('people') || [];
            old_role.set('people', old_role_people.filter((old_role_person_pk) => {
                return old_role_person_pk !== person_id;
            }));
            old_role.save();
        }
    },
    location_ids: Ember.computed('locations.[]', function() {
        return this.get('locations').map((location) => {
            return location.get('id');
        });
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
    person_locations: Ember.computed(function() {
        let store = this.get('store');
        let filter = function(join_model) {
            return join_model.get('person_pk') === this.get('id') && !join_model.get('removed');
        };
        return store.find('person-location', filter.bind(this), ['removed']);
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
        var store = this.get('store');
        var status_id = store.findOne('status').get('id');
        var phone_numbers = this.get('phone_numbers').filter(function(num) {
            if(num.get('invalid_number')) {
                return;
            }
            return num;
        }).map(function(num) {
            return num.serialize();
        });
        var addresses = this.get('addresses').filter(function(address) {
            if (address.get('invalid_address')) {
                return;
            }
            return address;
        }).map(function(address) {
            return address.serialize();
        });
        var locale = store.find('locale', {locale: this.get('locale')});
        var locale_fk = locale.objectAt(0) ? locale.objectAt(0).get('id') : '';
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
            role: this.get('role').get('id'),
            emails: [],
            locations: this.get('location_ids'),
            phone_numbers: phone_numbers,
            addresses: addresses,
            locale: locale_fk
        };
    },
    removeRecord() {
        this.get('store').remove('person', this.get('id'));
    }
});

export default Person;
