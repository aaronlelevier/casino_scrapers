import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import PhoneNumberDefaults from 'bsrs-ember/vendor/defaults/phone-number-type';
import ChildValidationComponent from 'bsrs-ember/mixins/validation/child';
import CustomValidMixin from 'bsrs-ember/mixins/validation/custom';
import {validateEach} from 'ember-cli-simple-validation/mixins/validate';
import { phoneIsAllowedRegion, phoneIsValidFormat } from 'bsrs-ember/validation/phone';

var InputMultiPhone = ChildValidationComponent.extend(CustomValidMixin, {
    uuid: inject('uuid'),
    tagName: 'div',
    classNames: ['input-multi t-input-multi-phone'],
    fieldNames: 'number',
    numberFormat: validateEach('number', phoneIsValidFormat),
    numberRegion: validateEach('number', phoneIsAllowedRegion),
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
            this.get('model').push(model);
            //this.get('person').get('phone_number_fks').push(id);
        },
        delete(entry) {
            this.get('model').remove(entry.id);//if I remove, then to compare if dirty on existing, only point of reference is p#_fks and can check if phone numbers is not in array
            //this.get('model').set('person_fk', undefined);//need some sort of cleanup if go this route
        }
    }
});

export default InputMultiPhone;
