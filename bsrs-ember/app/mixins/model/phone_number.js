import Ember from 'ember';

const { run } = Ember;

var PhoneNumberMixin = Ember.Mixin.create({
    phone_numbers_all: Ember.computed(function() {
        let pk = this.get('id');
        let store = this.get('simpleStore');
        let filter = function(phone_number) {
            return pk === phone_number.get('model_fk');
        };
        return store.find('phonenumber', filter);
    }),
    phone_numbers: Ember.computed(function() {
        let pk = this.get('id');
        let store = this.get('simpleStore');
        let filter = function(phone_number) {
            return pk === phone_number.get('model_fk') && !phone_number.get('removed');
        };
        return store.find('phonenumber', filter);
    }),
    phone_number_ids: Ember.computed('phone_numbers.[]', function() {
        return this.get('phone_numbers').mapBy('id');
    }),
    phoneNumbersIsDirty: Ember.computed('phone_numbers.[]', 'phone_numbers.@each.{isDirty,number,phone_number_type}', function() {
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
            if (num.get('isDirtyOrRelatedDirty')) {
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
    savePhoneNumbers() {
        this.cleanupPhoneNumbers();
        let phone_numbers = this.get('phone_numbers');
        phone_numbers.forEach((num) => {
            num.save();
            num.saveRelated();
        });
    },
    rollbackPhoneNumbers() {
        let store = this.get('simpleStore');
        let phone_numbers_to_remove = [];
        let phone_numbers = this.get('phone_numbers_all');
        phone_numbers.forEach((num) => {
            //remove
            if (num.get('removed')) {
                run(function() {
                    store.push('phonenumber', {id: num.get('id'), removed: undefined});
                });
            }
            //add
            if(num.get('invalid_number') && num.get('isNotDirty')) {
                phone_numbers_to_remove.push(num.get('id'));
            }
            num.rollback();
        });
        run(function() {
            phone_numbers_to_remove.forEach((id) => {
                store.remove('phonenumber', id);
            });
        });
    },
    cleanupPhoneNumbers() {
        let store = this.get('simpleStore');
        let phone_numbers_to_remove = [];
        let phone_numbers = this.get('phone_numbers');
        let phone_numbers_all = this.get('phone_numbers_all');
        let phone_fks = this.get('phone_number_fks');
        let phone_number_ids = this.get('phone_number_ids');
        phone_numbers_all.forEach((num) => {
            if(num.get('invalid_number') || num.get('removed')) {
                phone_numbers_to_remove.push(num.get('id'));
            }
        });
        run(function() {
            phone_numbers_to_remove.forEach((id) => {
                store.remove('phonenumber', id);
            });
        });
        this.cleanupPhoneNumberFKs();
    },
    cleanupPhoneNumberFKs() {
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
});

export default PhoneNumberMixin;
