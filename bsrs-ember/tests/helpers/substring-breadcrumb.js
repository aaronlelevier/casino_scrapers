import Ember from 'ember';

export default Ember.Test.registerHelper('substringBreadcrumb', function(app, str) {
  return str.substring(0,12); 
});
