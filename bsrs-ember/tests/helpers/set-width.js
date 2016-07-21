import Ember from 'ember';
const { run } = Ember;

/* @param {string} string - 'huge' 'mobile' */
export default Ember.Test.registerAsyncHelper('setWidth', function(application, string) {
  if (!string) {
    console.warn('mobile, huge or other width needs to be provided');
    return;
  }
  const flexi = application.__container__.lookup('service:device/layout');
  const breakpoints = flexi.get('breakpoints');
  const width = breakpoints.find(bp => bp.name === string).begin + 5;
  run(() => {
    flexi.set('width', width);
  });
});
