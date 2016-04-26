import Ember from 'ember';

/*
 * Error service
 * Right now assumes one msg per module.  Need to examine later
 * @param {string} module
 * @param {string} msg
 * @param {string} route specified at call site.  DTD has own error template for ex//
 * @method {logErr} Sets a msg based on the module
 * @method {unlogErr} Unsets msg based on module
 */
export default Ember.Service.extend({
  message: '',
  routing: Ember.inject.service('-routing'),
  transToError(route) {
    route = route || 'error';
    //TODO: this maybe should be intermediateTransitionTo, but not on routing service right now.  Error and loading templates use this by default.  Need to investigate
    this.get('routing').transitionTo(route);
  },
  logErr(msg, module) {
    let obj = {};
    obj[module] = msg;
    this.set('message', obj);
  },
  getMsg(module) {
    return this.get(`message.${module}`);
  }
});
