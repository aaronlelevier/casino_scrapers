import Ember from 'ember';

export default Ember.Test.registerAsyncHelper('urlContains', function(app, url, urlTest) {
  return url.includes(urlTest);
});
