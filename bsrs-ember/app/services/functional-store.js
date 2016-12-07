import Ember from 'ember';
const { get, inject } = Ember;
import getOwner from 'ember-getowner-polyfill';

/**
 * example data structure
 *
 * persistentContainer: {
 *  ticket-status: Map. {
 *    id
 *  }
 *   tickets: Map.{
 *     id: Obj,
 *     id: Obj
 *   },
 *   people: Map.{
 *     id: Obj,
 *     id: Obj
 *   }
 * }
 */


function factoryForType(type, store) {
  return getOwner(store)._lookupFactory('model:' + type);
}

function persistData(type, obj, functionalStore) {
  const persistentContainer = functionalStore.get('persistentContainer');
  const id = obj.id;
  const factory = factoryForType(type, functionalStore);
  const record = factory.create(obj);
  if (persistentContainer[type]) {
    return persistentContainer[type].set(obj.id, record); 
  }
  persistentContainer[type] = new Map();
  return persistentContainer[type].set(obj.id, record);
}

export default Ember.Service.extend({
  init() {
    this._super(...arguments);
    this.clear();
  },
  persistentContainer: {},
  /**
   * @method find 
   * @param type {String}
   * @return {Array} - return new array
   * @return {Object} - returns constant
   * find isn't even used in prod code, used in tests. Fact that is returns a new array is not useful at the time
   */
  find(type, id = undefined) {
    const containerObjs = this.get('persistentContainer')[type];
    if (id) {
      return containerObjs.get(id);
    }
    return Array.from(containerObjs.values());
  },

  push(type, obj) {
    const hydrated = persistData(type, obj, this);
    return hydrated.get(obj.id);
  },
  
  clear(type = undefined) {
    if (type) {
      const persistentContainer = this.get('persistentContainer');
      persistentContainer[type] = new Map();
    } else {
      this.set('persistentContainer', {});
    }
  }
});
