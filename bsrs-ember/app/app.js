import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';
Ember.warn = function() {};
Ember.deprecate = function() {};
//Ember.deprecate = function(value) {
//    if (!value.indexOf('Ember.keys is deprecated in favor of Object.keys') > 0) {    
//copy outside of read def - var original = Ember.deprecate;
//        original.apply(this, arguments); 
//    }
//};
var App;


Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver
});

//Ember.ENV.RAISE_ON_DEPRECATION = true;

loadInitializers(App, config.modulePrefix);

export default App;
