import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import ChildValidationComponent from 'bsrs-ember/mixins/validation/child';
import CustomValidMixin from 'bsrs-ember/mixins/validation/custom';
import {ValidationMixin, validateEach} from 'ember-cli-simple-validation/mixins/validate';
import { emailIsValidFormat } from 'bsrs-ember/validation/email';

var InputMultiEmail = ChildValidationComponent.extend(ValidationMixin, CustomValidMixin, {
    uuid: inject('uuid'),
    tagName: 'div',
    classNames: ['input-multi t-input-multi-email'],
    fieldNames: 'email',
    emailFormat: validateEach('email', emailIsValidFormat),
    actions: {
        changed(email, val) {
            Ember.run(() => {
                //move to model
                email.set('type', val);
            });
        },
        append() {
            var id = this.get('uuid').v4();
            var type = this.get('default_type').get('id');
            var related_pk = this.get('related_pk');
            var model = {id: id, type: type};
            model['model_fk'] = related_pk;
            this.get('model').push(model);
        },
        delete(entry) {
            this.get('model').push({id: entry.get('id'), removed: true});
        }
    }
});

export default InputMultiEmail;
