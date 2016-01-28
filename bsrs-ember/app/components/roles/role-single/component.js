import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';

var categoryValidation = function(arr) {
    return arr.get('length') > 0 ? true : false;
};

var RoleSingle = Ember.Component.extend(TabMixin, NewTabMixin, EditMixin, ValidationMixin, {
    repository: inject('role'),
    nameValidation: validate('model.name'),
    categoryValidation: validate('model.categories', categoryValidation),
    locationLevelValidation: validate('model.location_level'),
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                this._super();
            }
        },
        changedLocLevel(model, val) {
            model.set('location_level', val);
        },
    }
});

export default RoleSingle;
