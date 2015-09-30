import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import BaseComponent from 'bsrs-ember/components/base-component-new/component';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var LocationsNewComponent = BaseComponent.extend({
    repository: inject('location'),
    nameValidation: validate('model.name'),
    numberValidation: validate('model.number')
});

export default LocationsNewComponent;
