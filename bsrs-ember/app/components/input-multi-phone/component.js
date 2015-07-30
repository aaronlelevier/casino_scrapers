import Ember from 'ember';
import injectStore from 'bsrs-ember/utilities/store';
import inject from 'bsrs-ember/utilities/uuid';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import PhoneNumberDefaults from 'bsrs-ember/vendor/defaults/phone-number-type';

export default Ember.Component.extend({
    uuid: inject('uuid'),
    store: injectStore('main'),
    tagName: 'div',
    classNames: ['input-multi t-input-multi-phone'],
    fieldNames: 'number',
    actions: {
        changed(phonenumber, val) {
            Ember.run(() => {
                phonenumber.set('type', val);
            });
        },
        append() {
            var id = this.get('uuid').v4();
            var type = this.get('default_type').get('id');
            var related_field = this.get('related_field');
            var related_pk = this.get('related_pk');
            var model = {id: id, type: type};
            model[related_field] = related_pk;
            this.get('store').push('phonenumber', model);
        },
        delete(entry) {
            this.get('model').removeObject(entry);
        }
    }
}); 
