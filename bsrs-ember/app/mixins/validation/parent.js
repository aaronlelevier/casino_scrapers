import Ember from 'ember';
import {ValidationMixin} from 'ember-cli-simple-validation/mixins/validate';

//this.get("constructor.ClassMixin.ownerConstructor").toString()
var ParentValidationComponent = Ember.Component.extend(ValidationMixin, {
    eventbus: Ember.inject.service(),
    _setup: Ember.on('init', function() {
        this.child_validators = {};
        this.get('child_components').forEach(function(child) {
            this.get('eventbus').subscribe('bsrs-ember@component:' + child + ':', this, 'onValidation');
        }.bind(this));
    }),
    _teardown: Ember.on('willDestroyElement', function() {
        this.get('child_components').forEach(function(child) {
            this.get('eventbus').unsubscribe('bsrs-ember@component:' + child + ':');
        }.bind(this));
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
    }
});

export default ParentValidationComponent;
