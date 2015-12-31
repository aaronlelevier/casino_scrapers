import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';
import RelaxedMixin from 'bsrs-ember/mixins/validation/relaxed';

var LocationSingle = ParentValidationComponent.extend(RelaxedMixin, TabMixin, EditMixin, {
    repository: inject('location'),
    child_components: ['input-multi-phone', 'input-multi-address', 'input-multi-email'],
    classNames: ['wrapper', 'form'],
    nameValidation: validate('model.name'),
    actions: {
        save() {
            this.set('submitted', true);
            if (this.all_components_valid()) {
                this._super();
            }
        },
    }
});

export default LocationSingle;
