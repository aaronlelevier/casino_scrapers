import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var CategoryNewComponent = Ember.Component.extend(ValidationMixin, {
    repository: inject('category'),
    store: injectStore('main'),
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
                var model = this.get('model');
                var repository = this.get('repository');
                repository.insert(model).then(() => {
                    this.sendAction('save');
                });
            }
        },
        cancel() {
            this.sendAction('cancel', this.tab());
        },
    }
});

export default CategoryNewComponent;
