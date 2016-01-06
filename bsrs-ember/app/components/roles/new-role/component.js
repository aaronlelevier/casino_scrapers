import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var categoryValidation = function(arr) {
    return arr.get('length') > 0 ? true : false;
};

var RoleNew = Ember.Component.extend(TabMixin, NewTabMixin, ValidationMixin, {
    repository: inject('role'),
    nameValidation: validate('model.name'),
    locationLevelValidation: validate('model.location_level'),
    categoryValidation: validate('model.categories', categoryValidation),
    actions: {
        changed(model, val) {
            model.set('role_type', val);
        },
        changedLocLevel(model, val) {
            model.set('location_level', val);
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
