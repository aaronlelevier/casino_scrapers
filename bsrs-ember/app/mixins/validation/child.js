import Ember from 'ember';
import {ValidationMixin} from 'ember-cli-simple-validation/mixins/validate';

var name = function(component) {
    return component.get('constructor.ClassMixin.ownerConstructor').toString();
};

var ChildValidationComponent = Ember.Component.extend(ValidationMixin, {
    eventbus: Ember.inject.service(),
    observeValid: Ember.observer('valid', function() {
        Ember.run.once(this, 'processValid');
    }),
    processValid: function() {
        this.get('eventbus').publish(name(this), this, 'onValidation', this.get('valid'));
    }
});

export default ChildValidationComponent;
