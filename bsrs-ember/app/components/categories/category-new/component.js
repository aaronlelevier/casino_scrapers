import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import BaseComponent from 'bsrs-ember/components/base-component-new/component';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var CategoryNewComponent = BaseComponent.extend({
    repository: inject('category'),
    nameValidation: validate('model.name'),
    descriptionValidation: validate('model.description'),
    costCodeValidation: validate('model.cost_code'),
    labelValidation: validate('model.label'),
    subCategoryLabelValidation: validate('model.subcategory_label')
});

export default CategoryNewComponent;
