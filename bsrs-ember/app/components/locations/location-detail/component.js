import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';
import RelaxedMixin from 'bsrs-ember/mixins/validation/relaxed';

var LocationSingle = ParentValidationComponent.extend(RelaxedMixin, NewTabMixin, TabMixin, EditMixin, {
    repository: inject('location'),
    child_components: ['input-multi-phone', 'input-multi-address', 'input-multi-email'],
    classNames: ['wrapper', 'form'],
    nameValidation: validate('model.name'),
    numberValidation: validate('model.number'),
    locationLevelValidation: validate('model.location_level'),
    isDisabled: Ember.computed('model.location_level', function() {
        if(this.get('model').get('new') && !this.get('model').get('location_level')){
            return true;
        }
        return false;
    }),
    extra_params: Ember.computed(function(){
        const llevel = this.get('model.location_level.id') ? this.get('model.location_level.id') : this.get('model.top_location_level.id');
        const pk = this.get('model').get('id');
        return {llevel, pk};
    }),
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
