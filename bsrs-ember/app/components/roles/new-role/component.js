import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var RoleNew = Ember.Component.extend(TabMixin, NewTabMixin, ValidationMixin, {
    repository: inject('role'),
    nameValidation: validate('model.name'),
    actions: {
        changed(model, val) {
            Ember.run(() => {
                model.set('role_type', val);
            });
        },
        changedLocLevel(model, val) {
            Ember.run(() => {
                model.set('location_level', val);
            });
        },
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                this._super();
            }
        }
    }
});

export default RoleNew;
