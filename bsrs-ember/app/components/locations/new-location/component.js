import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var LocationsNewComponent = Ember.Component.extend(TabMixin, NewTabMixin, ValidationMixin, {
    repository: inject('location'),
    nameValidation: validate('model.name'),
    numberValidation: validate('model.number'),
    actions: {
        saveNew() {
            this.set('submitted', true);
            if (this.get('valid')) {
                this._super();
            }
        }
    }
});

export default LocationsNewComponent;
