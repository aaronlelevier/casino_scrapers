import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import NewMixin from 'bsrs-ember/mixins/model/new';
import inject from 'bsrs-ember/utilities/store';
import equal from 'bsrs-ember/utilities/equal';
import EmailMixin from 'bsrs-ember/mixins/model/email';
import PhoneNumberMixin from 'bsrs-ember/mixins/model/phone_number';
import AddressMixin from 'bsrs-ember/mixins/model/address';
import CopyMixin from 'bsrs-ember/mixins/model/copy';

var run = Ember.run;

var LocationModel = Model.extend(CopyMixin, NewMixin, AddressMixin, PhoneNumberMixin, EmailMixin, {
    store: inject('main'),
    name: attr(''),
    number: attr(''),
    status_fk: undefined,
    tickets: [],
    email_fks: [],
    phone_number_fks: [],
    address_fks: [],
    location_level_fk: undefined,
    locationLevelIsDirty: Ember.computed('location_levels.[]', 'location_level_fk', function() {
        const location_level_id = this.get('location_level.id');
        const location_level_fk = this.get('location_level_fk');
        if(location_level_id) {
            return location_level_id === location_level_fk ? false : true;
        }
        if(!location_level_id && location_level_fk) {
            return true;
        }
    }),
    locationLevelIsNotDirty: Ember.computed.not('locationLevelIsDirty'),
    location_level: Ember.computed.alias('location_levels.firstObject'),
    location_levels: Ember.computed(function() {
        const pk = this.get('id');
        let filter = (location_level) => {
            let location_pks = location_level.get('locations') || [];
            return Ember.$.inArray(pk, location_pks) > -1;
        };
        return this.get('store').find('location-level', filter);
    }),
    status: Ember.computed.alias('belongs_to.firstObject'),
    belongs_to: Ember.computed(function() {
        let location_id = this.get('id');
        let filter = function(status) {
            let locations = status.get('locations');
            return Ember.$.inArray(location_id, locations) > -1;
        };
        return this.get('store').find('location-status', filter);
    }),
    statusIsDirty: Ember.computed('status', 'status_fk', function() {
        let status = this.get('status');
        let status_fk = this.get('status_fk');
        if (status) {
            return status.get('id') === status_fk ? false : true;
        }
        if(!status && status_fk) {
            return true;
        }
        return false;
    }),
    statusIsNotDirty: Ember.computed.not('statusIsDirty'),
    change_status(new_status_id) {
        let location_id = this.get('id');
        let store = this.get('store');
        let old_status = this.get('status');
        if(old_status) {
            let old_status_locations = old_status.get('locations') || [];
            let updated_old_status_locations = old_status_locations.filter((id) => {
                return id !== location_id;
            });
            run(function() {
                store.push('location-status', {id: old_status.get('id'), locations: updated_old_status_locations});
            });
            // old_status.set('locations', updated_old_status_locations);
        }
        let new_status = store.find('location-status', new_status_id);
        let new_status_locations = new_status.get('locations') || [];
        if (new_status_locations) {
            run(function() {
                store.push('location-status', {id: new_status.get('id'), locations: new_status_locations.concat(location_id)});
            });
            // new_status.set('locations', new_status_locations.concat(location_id));
        }
    },
    saveStatus() {
        const pk = this.get('id');
        const store = this.get('store');
        const status = this.get('status');
        if (status) {
            run(function() {
                store.push('location', {id: pk, status_fk: status.get('id')});
            });
        }
    },
    rollbackStatus() {
        let status = this.get('status');
        let status_fk = this.get('status_fk');
        if(status && status.get('id') !== status_fk) {
            this.change_status(status_fk);
        }
    },
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'locationLevelIsDirty', 'statusIsDirty', 'phoneNumbersIsDirty', 'addressesIsDirty', 'emailsIsDirty', 'childrenIsDirty', function() {
        return this.get('isDirty') || this.get('locationLevelIsDirty') || this.get('statusIsDirty') || this.get('phoneNumbersIsDirty') || this.get('addressesIsDirty') || this.get('emailsIsDirty') || this.get('childrenIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    change_location_level(new_location_level_id) {
        const location_id = this.get('id');
        const store = this.get('store');
        const old_location_level = this.get('location_level');
        if(old_location_level) {
            const old_locations = old_location_level.get('locations') || [];
            let updated_old_locations = old_locations.filter((id) => {
                return id !== location_id;
            });
            run(function() {
                store.push('location-level', {id: old_location_level.get('id'), locations: updated_old_locations});
            });
            // old_location_level.set('locations', updated_old_locations);
        }
        if(!new_location_level_id){
            return;
        } else{
            const new_location_level = store.find('location-level', new_location_level_id);
            const new_locations = new_location_level.get('locations') || [];
            run(function() {
                store.push('location-level', {id: new_location_level.get('id'), locations: new_locations.concat(location_id)});
            });
            // new_location_level.set('locations', new_locations.concat(location_id));
        }
    },
    saveLocationLevel() {
        const pk = this.get('id');
        const store = this.get('store');
        const location_level = this.get('location_level');
        if (location_level) {
            location_level.save();
            run(function() {
                store.push('location', {id: pk, location_level_fk: location_level.get('id')});
            });
            // this.set('location_level_fk', this.get('location_level').get('id'));
        } else {
            run(function() {
                store.push('location', {id: pk, location_level_fk: undefined});
            });
            // this.set('location_level_fk', undefined);
        }
    },
    rollbackLocationLevel() {
        const location_level = this.get('location_level');
        const location_level_fk = this.get('location_level_fk');
        this.change_location_level(location_level_fk);
    },
    saveRelated() {
        this.saveLocationLevel();
        this.saveStatus();
        this.saveEmails();
        this.savePhoneNumbers();
        this.saveAddresses();
        this.saveChildren();
    },
    rollbackRelated() {
        this.rollbackLocationLevel();
        this.rollbackStatus();
        this.rollbackEmails();
        this.rollbackPhoneNumbers();
        this.rollbackAddresses();
    },
    serialize() {
        var emails = this.get('emails').filter(function(email) {
            if(email.get('invalid_email')) {
                return;
            }
            return email;
        }).map((email) => {
            return email.serialize();
        });
        var phone_numbers = this.get('phone_numbers').filter(function(num) {
            if(num.get('invalid_number')) {
                return;
            }
            return num;
        }).map((num) => {
            return num.serialize();
        });
        var addresses = this.get('addresses').filter(function(address) {
            if (address.get('invalid_address')) {
                return;
            }
            return address;
        }).map((address) => {
            return address.serialize();
        });
        return {
            id: this.get('id'),
            name: this.get('name'),
            number: this.get('number'),
            status: this.get('status.id'),
            location_level: this.get('location_level.id'),
            children: this.get('children_ids'),
            parents: [],
            emails: emails,
            phone_numbers: phone_numbers,
            addresses: addresses,
        };
    },
    removeRecord() {
        run(() => {
            this.get('store').remove('location', this.get('id'));
        });
    },
    /////////
    parents: Ember.computed(function() {
        const location_parents = this.get('location_parents'); 
        const filter = function(parent) {
            const parent_pks = this.mapBy('parent_pk');
            return Ember.$.inArray(parent.get('id'), parent_pks) > -1;
        };
        return this.get('store').find('location', filter.bind(location_parents));
    }),
    location_parents: Ember.computed(function() {
        const pk = this.get('id');
        const filter = (join_model) => {
            return join_model.get('location_pk') === pk && !join_model.get('removed');
        };
        return this.get('store').find('location-parents', filter);
    }),
    location_children_fks: [],
    location_parents_fks: [],
    children_ids: Ember.computed('children.[]', function() {
        return this.get('children').mapBy('id'); 
    }),
    children: Ember.computed('location_children.[]', function() {
        const location_children = this.get('location_children'); 
        const filter = function(child) {
            const child_pks = this.mapBy('child_pk');
            return Ember.$.inArray(child.get('id'), child_pks) > -1;
        };
        return this.get('store').find('location', filter.bind(location_children));
    }),
    location_children_ids: Ember.computed('location_children.[]', function() {
        return this.get('location_children').mapBy('id'); 
    }),
    location_children: Ember.computed(function() {
        const pk = this.get('id');
        const filter = (join_model) => {
            return join_model.get('location_pk') === pk && !join_model.get('removed');
        };
        return this.get('store').find('location-children', filter);
    }),
    add_child(child_id) {
        const store = this.get('store'); 
        const location_children = store.find('location-children').toArray();
        //check existing
        let existing = location_children.filter((m2m) => {
            return m2m.get('child_pk') === child_id;
        }).objectAt(0);
        run(() => {
            if(existing){ store.push('location-children', {id: existing.get('id'), removed: undefined}); }
            else{ store.push('location-children', {id: Ember.uuid(), location_pk: this.get('id'), child_pk: child_id}); }
        });
    },
    remove_child(child_id) {
        const store = this.get('store'); 
        const m2m_pk = this.get('location_children').filter((m2m) => {
            return m2m.get('child_pk') === child_id;
        }).objectAt(0).get('id'); 
        run(() => {
            store.push('location-children', {id: m2m_pk, removed: true});
        });
    },
    childrenIsDirty: Ember.computed('children.[]', 'location_children_fks.[]', function() {
        const children = this.get('children');
        const location_children_ids = this.get('location_children_ids');
        const previous_m2m_fks = this.get('location_children_fks') || [];
        if(children.get('length') !== previous_m2m_fks.length) {
            return equal(location_children_ids, previous_m2m_fks) ? false : true;
        }
        return equal(location_children_ids, previous_m2m_fks) ? false : true;
    }),
    childrenIsNotDirty: Ember.computed.not('childrenIsDirty'),
    saveChildren() {
        const location_children = this.get('location_children');
        const location_children_ids = this.get('location_children_ids') || [];
        const previous_m2m_fks = this.get('location_children_fks') || [];
        //add
        location_children.forEach((join_model) => {
            if (Ember.$.inArray(join_model.get('id'), previous_m2m_fks) === -1) {
                //TODO: use concat but won't work for multiple
                // store.push('location', {id: location_id, location_children_fks: previous_m2m_fks.concat(join_model.get('id'))});
                previous_m2m_fks.pushObject(join_model.get('id'));
            } 
        });
        //remove
        for (let i=previous_m2m_fks.length-1; i>=0; --i) {
            if (Ember.$.inArray(previous_m2m_fks[i], location_children_ids) === -1) {
                previous_m2m_fks.removeObject(previous_m2m_fks[i]);
            } 
        }
    },
});

export default LocationModel;
