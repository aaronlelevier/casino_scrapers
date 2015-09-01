import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import PersonLocationsMixin from 'bsrs-ember/mixins/person/locations';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

export default Ember.Component.extend(ValidationMixin, PersonLocationsMixin, {
    eventbus: Ember.inject.service(),
    repository: inject('person'),
    location_repo: inject('location'),
    classNames: ['wrapper', 'form'],
    attemptedTransition: '',
    usernameValidation: validate('model.username'),
    _setup: Ember.on('init', function(){
        this.child_validators = {};
        this.get('eventbus').subscribe('person-single:input-multi-phone', this, 'onValidation');
        this.get('eventbus').subscribe('person-single:input-multi-address', this, 'onValidation');
        this._super();
    }),
    _teardown: Ember.on('willDestroyElement', function(){
        this.get('eventbus').unsubscribe('person-single:input-multi-phone');
        this.get('eventbus').unsubscribe('person-single:input-multi-address');
    }),
    onValidation: function(child, eventName, valid) {
        let unique_validation = child.get('elementId');
        this.child_validators[unique_validation] = valid;
    },
    all_components_valid: function() {
        var value = true;
        Object.keys(this.child_validators).forEach((key) => {
            value = this.child_validators[key] && value;
        });
        return this.get('valid') && value === true;
    },
    actions: {
        savePerson() {
            this.get('model').set('dirtyModel', false);
            this.set('submitted', true);
            if (this.all_components_valid()) {
                var model = this.get('model');
                var repository = this.get('repository');
                repository.update(model).then(() => {
                    this.sendAction('savePerson');
                });
            }
        },
        cancelPerson() {
            this.sendAction('cancelPerson');
        },
        deletePerson() {
            var model = this.get('model');
            var repository = this.get('repository');
            repository.delete(model.get('id'));
            this.sendAction('redirectUser');
        },
        dirtyModel() {
            this.get('model').set('dirtyModel', true);
        }
    }
});
