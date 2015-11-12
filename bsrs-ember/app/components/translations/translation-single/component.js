import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';

var TranslationSingle = Ember.Component.extend(TabMixin, EditMixin, ValidationMixin, {
    repository: inject('location'),
    keyValidation: validate('model.key'),
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                this._super();
            }
        }
    }
});

export default TranslationSingle;
