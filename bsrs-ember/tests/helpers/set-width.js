import Ember from 'ember';

/* @param {string} string - 'huge' 'mobile' */
export default Ember.Test.registerAsyncHelper('setWidth', function(application, string) {
  if (!string) {
    console.warn('mobile, huge or other width needs to be provided');
    return;
  }
  flexi = application.__container__.lookup('service:device/layout');
  const breakpoints = flexi.get('breakpoints');
  bp = {};
  breakpoints.forEach((point) => {
    bp[point.name] = point.begin + 5;
  });
  flexi.set('width', bp[string]);
});
