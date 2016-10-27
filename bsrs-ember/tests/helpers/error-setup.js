import Ember from 'ember';

export default Ember.Test.registerAsyncHelper('errorSetup', function(app) {
  const originalLoggerError = Ember.Logger.error;
  const originalTestAdapterException = Ember.Test.adapter.exception;
  Ember.Logger.error = function() {};
  Ember.Test.adapter.exception = function() {};
  return { originalLoggerError, originalTestAdapterException };
});

export default Ember.Test.registerAsyncHelper('errorTearDown', function(app, originalLoggerError, originalTestAdapterException) {
  Ember.Logger.error = originalLoggerError;
  Ember.Test.adapter.exception = originalTestAdapterException;
});
