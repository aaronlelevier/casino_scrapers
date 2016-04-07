import Ember from 'ember';

/*
 * Error service
 * Right now assumes one msg per module.  Need to examine later
 * @param {string} module
 * @param {string} msg
 * @param {string} route specified at call site
 * @method {logErr} Sets a msg based on the module
 * @method {unlogErr} Unsets msg based on module
 */
export default Ember.Service.extend({
  message: '',
  routing: Ember.inject.service('-routing'),
  transToError(route) {
    route = route || 'error';
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
