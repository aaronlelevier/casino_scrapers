import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import ChildValidationComponent from 'bsrs-ember/mixins/validation/child';
import CustomValidMixin from 'bsrs-ember/mixins/validation/custom';
import {ValidationMixin, validateEach} from 'ember-cli-simple-validation/mixins/validate';
import addressNameValidation from 'bsrs-ember/validation/address_name';
import postalCodeValidation from 'bsrs-ember/validation/postal_code';

var MultiAddressComponent = ChildValidationComponent.extend(ValidationMixin, CustomValidMixin, {
    uuid: inject('uuid'),
    tagName: 'div',
    classNames: ['input-multi-address t-input-multi-address'],
    addressFormat: validateEach('address', addressNameValidation),
    postal_codeFormat: validateEach('postal_code', postalCodeValidation),
    actions: {
        changed(address, val) {
            address.set('type', val);
        },
        append() {
            const id = this.get('uuid').v4();
            const type = this.get('default_type').get('id');
            const related_pk = this.get('related_pk');
            var model = {id: id, type: type};
            model['model_fk'] = related_pk;
            this.get('model').push(model);
        },
        delete(entry) {
            this.get('model').push({id: entry.get('id'), removed: true});
        },
        changeState(state, val) {
            const state_id = parseInt(val, 10);
            state.set('state', state_id);
        },
        changeCountry(country, val) {
            country.set('country', val);
        }
    }
});

export default MultiAddressComponent;
