import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import ChildValidationComponent from 'bsrs-ember/mixins/validation/child';
import CustomValidMixin from 'bsrs-ember/mixins/validation/custom';
import {ValidationMixin, validateEach} from 'ember-cli-simple-validation/mixins/validate';
import { phoneIsAllowedRegion, phoneIsValidFormat } from 'bsrs-ember/validation/phone';

var InputMultiPhone = ChildValidationComponent.extend(ValidationMixin, CustomValidMixin, {
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
        },
        delete(entry) {
            this.get('model').push({id: entry.get('id'), removed: true});
        }
    }
});

export default InputMultiPhone;
