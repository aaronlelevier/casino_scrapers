import Ember from 'ember';

/**
 * Global Event Bus
 * operating in own context and injected into object
*/
var EventBus = Ember.Service.extend(Ember.Evented, {
  publish: function() {
    return this.trigger.apply(this, arguments);
  },
  subscribe: function() {
    return this.on.apply(this, arguments);
  },
  unsubscribe: function() {
    return this.off.apply(this, arguments);
  }
});

export default EventBus;
