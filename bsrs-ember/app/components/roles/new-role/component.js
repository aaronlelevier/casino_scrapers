import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var RoleNew = Ember.Component.extend(ValidationMixin, {
    repository: inject('role'),
    nameValidation: validate('model.name'),
    store: injectStore('main'),
    tab(){
        return this.get('store').find('tab', this.get('model.id'));
    },
    actions: {
        changed(model, val) {
            Ember.run(() => {
                model.set('role_type', val);
            });
        },
        changedLocLevel(model, val) {
            Ember.run(() => {
                model.set('location_level', val);
            });
        },
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

export default RoleNew;
