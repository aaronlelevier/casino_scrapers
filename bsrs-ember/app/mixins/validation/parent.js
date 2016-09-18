import Ember from 'ember';
// import {ValidationMixin} from 'ember-cli-simple-validation/mixins/validate';

var ParentValidationComponent = Ember.Component.extend({//ValidationMixin, {
  eventbus: Ember.inject.service(),
  _setup: Ember.on('init', function() {
    this.child_validators = {};
    this.get('child_components').forEach((child) => {
      this.get('eventbus').subscribe('bsrs-ember@component:' + child + ':', this, 'onValidation');
    }.bind(this));
  }),
  _teardown: Ember.on('willDestroyElement', function() {
    this.get('child_components').forEach((child) => {
      this.get('eventbus').unsubscribe('bsrs-ember@component:' + child + ':');
    }.bind(this));
  }),
  onValidation(child, eventName, valid) {
    let unique_validation = child.get('elementId');
    this.child_validators[unique_validation] = valid;
  }
});

export default ParentValidationComponent;
