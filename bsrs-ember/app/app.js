import Ember from 'ember';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

document.addEventListener('keydown', function(evt) {
  // Hitting "enter" in a text input field doesn't save the form.
  if (evt.keyCode === 13 && evt.target.localName === 'input') {
    evt.preventDefault();
  }
});

let App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
