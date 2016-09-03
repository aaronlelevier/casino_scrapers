import Ember from 'ember';

const { run } = Ember;

var AddressMixin = Ember.Mixin.create({
    addresses_all: Ember.computed(function() {
        let pk = this.get('id');
        let store = this.get('simpleStore');
        let filter = function(address) {
            return pk === address.get('model_fk');
        };
        return store.find('address', filter);
    }),
    addresses: Ember.computed(function() {
        let pk = this.get('id');
        let store = this.get('simpleStore');
        let filter = function(address) {
            return pk === address.get('model_fk') && !address.get('removed');
        };
        return store.find('address', filter);
    }),
    address_ids: Ember.computed('addresses.[]', function() {
        return this.get('addresses').mapBy('id');
    }),
    saveAddresses() {
        this.cleanupAddresses();
        let addresses = this.get('addresses');
        addresses.forEach((address) => {
            address.saveRelated();
            address.save();
        });
    },
    addressesIsDirty: Ember.computed('addresses.@each.{isDirty,address,address_type,city,state,postal_code,country}', function() {
        let address_dirty = false;
        let addresses = this.get('addresses');
        let address_fks = this.get('address_fks');
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
            if (address.get('isDirty') || address.get('isDirtyOrRelatedDirty')) {
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
    rollbackAddresses() {
        let store = this.get('simpleStore');
        let addresses_to_remove = [];
        let addresses = this.get('addresses_all');
        run(function() {
            addresses.forEach((address) => {
                if (address.get('removed')) {
                    store.push('address', {id: address.get('id'), removed: undefined});
                }
                if(address.get('invalid_address') && address.get('isNotDirty')) {
                    addresses_to_remove.push(address.get('id'));
                }
                address.rollback();
            });
            addresses_to_remove.forEach((id) => {
                store.remove('address', id);
            });
        });
    },
    cleanupAddresses: function() {
        let store = this.get('simpleStore');
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
        run(function() {
            addresses_to_remove.forEach((id) => {
                store.remove('address', id);
            });
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
});

export default AddressMixin;
