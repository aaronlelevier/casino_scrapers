import Ember from 'ember';
import BaseComponent from 'bsrs-ember/components/base-component-new/component';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var LocationsNewComponent = BaseComponent.extend(ValidationMixin, {
    nameValidation: validate('model.name'),
    numberValidation: validate('model.number'),
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                this._super();
            }
        }
    }
});

export default LocationsNewComponent;
