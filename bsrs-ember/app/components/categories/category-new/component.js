import Ember from 'ember';
import BaseComponent from 'bsrs-ember/components/base-component-new/component';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var CategoryNewComponent = BaseComponent.extend(ValidationMixin, {
    nameValidation: validate('model.name'),
    descriptionValidation: validate('model.description'),
    costCodeValidation: validate('model.cost_code'),
    labelValidation: validate('model.label'),
    subCategoryLabelValidation: validate('model.subcategory_label'),
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                this._super();
            }
        }
    } 
});

export default CategoryNewComponent;
