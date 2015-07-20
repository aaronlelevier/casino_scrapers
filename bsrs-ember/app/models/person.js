import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';

export default Model.extend({
    store: inject('main'),
    username: attr(),
    phone_numbers: attr(),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'phoneNumbersIsDirty', function() {
       return this.get('isDirty') || this.get('phoneNumbersIsDirty'); 
    }).volatile(), 
    phoneNumbersIsDirty: Ember.computed(function() {
        var store = this.get('store');
        var phone_numbers = store.find('phonenumber', {person_id: this.get('id')});
        var phone_number_dirty = false;
        phone_numbers.forEach((num) => {
            if (num.get('isDirty')) {
                phone_number_dirty = true;
            }
        });
        return phone_number_dirty;
    }).volatile(),
    phoneNumbersIsNotDirty: Ember.computed.not('phoneNumbersIsDirty').volatile(),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty').volatile()
});
