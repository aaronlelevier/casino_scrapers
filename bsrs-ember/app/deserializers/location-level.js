import Ember from 'ember';

var LocationLevelDeserializer = Ember.Object.extend({
  deserialize(response, options) {
    if (typeof options === 'undefined') {
      this._deserializeList(response);
    } else {
      return this._deserializeSingle(response, options);
    }
  },
  _deserializeSingle(response, id) {
    const store = this.get('simpleStore');
    const existing = store.find('location-level', id);
    let location_level = existing;
    //TODO: investigate why need if check
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
  _deserializeList(response) {
    const store = this.get('simpleStore');
    response.results.forEach((model) => {
      const location_level = store.push('location-level-list', model);
    });
  }
});

export default LocationLevelDeserializer;
