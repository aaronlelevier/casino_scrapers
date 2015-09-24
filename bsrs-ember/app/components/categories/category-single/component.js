import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var CategorySingleComponent = Ember.Component.extend(ValidationMixin, {
    store: injectStore('main'),
    repository: inject('category'),
    nameValidation: validate('model.name'),
    descriptionValidation: validate('model.description'),
    costCodeValidation: validate('model.cost_code'),
    labelValidation: validate('model.label'),
    subCategoryLabelValidation: validate('model.subcategory_label'),
    tab(){
        return this.get('store').find('tab', this.get('model.id'));
    },
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                let model = this.get('model');
                let repository = this.get('repository');
                repository.update(model).then(() => {
                    this.sendAction('save', this.tab());
                });
            }
        },
        cancel() {
            this.sendAction('cancel', this.tab());
        },
        delete() {
            var model = this.get('model');
            var repository = this.get('repository');
            this.sendAction('delete', this.tab(), model, repository);
        }
    } 
});

export default CategorySingleComponent;
