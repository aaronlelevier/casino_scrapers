import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var LocationsNewComponent = Ember.Component.extend(ValidationMixin, {
    repository: inject('location'),
    store: injectStore('main'),
    nameValidation: validate('model.name'),
    numberValidation: validate('model.number'),
    tab(){
        return this.get('store').find('tab', this.get('model.id'));
    },
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                var model = this.get('model');
                var repository = this.get('repository');
                repository.insert(model).then(() => {
                    this.sendAction('save');
                });
            }
        },
        cancel() {
            this.sendAction('cancel', this.tab());
        }
    }
});

export default LocationsNewComponent;
