import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import phone_number_validation from 'bsrs-ember/validation/phone';
import PhoneNumberDefaults from 'bsrs-ember/vendor/defaults/phone-number-type';
import ChildValidationComponent from 'bsrs-ember/mixins/validation/child';
import CustomValidMixin from 'bsrs-ember/mixins/validation/custom';
import {validateEach} from 'ember-cli-simple-validation/mixins/validate';

var InputMultiPhone = ChildValidationComponent.extend(CustomValidMixin, {
    uuid: inject('uuid'),
    tagName: 'div',
    classNames: ['input-multi t-input-multi-phone'],
    fieldNames: 'number',
    number: validateEach('number', phone_number_validation),
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
            var model = {id: id};
            model[related_field] = related_pk;
            var phone_number = this.get('model').push(model);
            phone_number.set('type', type);
        },
        delete(entry) {
            this.get('model').remove(entry.id);
            this.sendAction('delete');
        }
    }
});

export default InputMultiPhone;
