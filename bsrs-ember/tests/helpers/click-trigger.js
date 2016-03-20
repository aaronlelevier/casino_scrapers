import Ember from 'ember';

export default function clickTrigger(scope) {
  let selector = '.ember-power-select-trigger';
  if (scope) {
    selector = scope + ' ' + selector;
  }
  let event = new window.Event('mousedown', { bubbles: true, cancelable: true, view: window });
  Ember.run(() => Ember.$(selector)[0].dispatchEvent(event));
}

