import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var ThirdPartySingle = Ember.Component.extend(TabMixin, EditMixin, ValidationMixin, {
    repository: inject('third-party'),
    nameValidation: validate('model.name'),
    numberValidation: validate('model.number'),
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                this._super(...arguments);
            }
        },
        changedStatus(model, val) {
            model.set('status', val);
        }
    }
});

export default ThirdPartySingle;
