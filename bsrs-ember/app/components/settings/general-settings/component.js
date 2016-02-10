import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';

var GeneralSettings = Ember.Component.extend(TabMixin, EditMixin, {
    repository: inject('setting'),
    classNames: ['wrapper', 'form'],
    welcomeTextValidation: validate('model.welcome_text'),
    actions: {
        save() {
            this.set('submitted', true);
            this._super();
        }
    }
});

export default GeneralSettings;
