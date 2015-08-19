import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var CategorySingleComponent = Ember.Component.extend(ValidationMixin, {
    repository: inject('category'),
    nameValidation: validate('model.name'),
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                var model = this.get('model');
                var repository = this.get('repository');
                repository.update(model).then(() => {
                    this.sendAction('save');
                });
            }
        },
        cancel() {
            this.sendAction('cancel');
        },
        delete() {

        }
    } 
});

export default CategorySingleComponent;
