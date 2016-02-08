import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import ChildValidationComponent from 'bsrs-ember/mixins/validation/child';
import CustomValidMixin from 'bsrs-ember/mixins/validation/custom';
import {ValidationMixin, validateEach} from 'ember-cli-simple-validation/mixins/validate';
import { emailIsValidFormat } from 'bsrs-ember/validation/email';

const { run } = Ember;

var InputMultiEmail = ChildValidationComponent.extend(ValidationMixin, CustomValidMixin, {
    uuid: inject('uuid'),
    tagName: 'div',
    classNames: ['input-multi t-input-multi-email'],
    fieldNames: 'email',
    emailFormat: validateEach('email', emailIsValidFormat),
    actions: {
        changed(email, val) {
            email.set('type', val);
        },
        append() {
            const id = this.get('uuid').v4();
            const type = this.get('default_type').get('id');
            const related_pk = this.get('related_pk');
            var model = {id: id, type: type};
            model['model_fk'] = related_pk;
            run(() => {
                this.get('model').push(model);
            });
        },
        delete(entry) {
            run(() => {
                this.get('model').push({id: entry.get('id'), removed: true});
            });
        }
    }
});

export default InputMultiEmail;
