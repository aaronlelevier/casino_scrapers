import Ember from 'ember';

export default Ember.Test.registerAsyncHelper('errorSetup', function(app) {
  this.originalLoggerError = Ember.Logger.error;
  this.originalTestAdapterException = Ember.Test.adapter.exception;
  Ember.Logger.error = function() {};
  Ember.Test.adapter.exception = function() {};
});

export default Ember.Test.registerAsyncHelper('errorTearDown', function(app) {
  Ember.Logger.error = this.originalLoggerError;
  Ember.Test.adapter.exception = this.originalTestAdapterException;
});
