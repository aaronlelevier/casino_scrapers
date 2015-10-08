import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import Address from 'bsrs-ember/models/address';
import AddressDefaults from 'bsrs-ember/vendor/defaults/address-type';
import ChildValidationComponent from 'bsrs-ember/mixins/validation/child';
import CustomValidMixin from 'bsrs-ember/mixins/validation/custom';
import {validateEach} from 'ember-cli-simple-validation/mixins/validate';
import addressNameValidation from 'bsrs-ember/validation/address_name';
import postalCodeValidation from 'bsrs-ember/validation/postal_code';

var MultiAddressComponent = ChildValidationComponent.extend(CustomValidMixin, {
    uuid: inject('uuid'),
    tagName: 'div',
    classNames: ['input-multi-address t-input-multi-address'],
    addressFormat: validateEach('address', addressNameValidation),
    postal_codeFormat: validateEach('postal_code', postalCodeValidation),
    actions: {
        changed(address, val) {
            Ember.run(() => {
                address.set('type', val);
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
        },
        changeState(state, val) {
            Ember.run(() => {
                var state_id = parseInt(val, 10);
                state.set('state', state_id);
            });
        },
        changeCountry(country, val) {
            Ember.run(() => {
                country.set('country', val);
            });
        }
    }
});

export default MultiAddressComponent;
