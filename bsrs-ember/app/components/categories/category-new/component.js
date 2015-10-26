import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var CategoryNewComponent = Ember.Component.extend(TabMixin, NewTabMixin, ValidationMixin, {
    repository: inject('category'),
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
