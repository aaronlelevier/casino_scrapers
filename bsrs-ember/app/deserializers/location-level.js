import Ember from 'ember';

var LocationLevelDeserializer = Ember.Object.extend({
  deserialize(response, options) {
    if (typeof options === 'undefined') {
      this.deserialize_list(response);
    } else {
      return this.deserialize_single(response, options);
    }
  },
  deserialize_single(response, id) {
    const store = this.get('simpleStore');
    const existing = store.find('location-level', id);
    let location_level = existing;
    if (!existing.get('id') || existing.get('isNotDirtyOrRelatedNotDirty')) {
      response.children_fks = response.children || [];
      response.parent_fks = response.parents || [];
      delete response.children;
      delete response.parents;
      response.detail = true;
      location_level = store.push('location-level', response);
      location_level.save();
    }
    return location_level;
  },
  deserialize_list(response) {
    const store = this.get('simpleStore');
    response.results.forEach((model) => {
      const location_level = store.push('location-level-list', model);
    });
  }
});

export default LocationLevelDeserializer;


