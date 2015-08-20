import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

let CategorySingleComponent = Ember.Component.extend(ValidationMixin, {
    repository: inject('category'),
    nameValidation: validate('model.name'),
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                let model = this.get('model');
                let repository = this.get('repository');
                repository.update(model).then(() => {
                    this.sendAction('save');
                });
            }
        },
        cancel() {
            this.sendAction('redirectUser');
        },
        delete() {
            var model = this.get('model');
            var repository = this.get('repository');
            repository.delete(model.get('id'));
            this.sendAction('redirectUser');
        }
    } 
});

export default CategorySingleComponent;
