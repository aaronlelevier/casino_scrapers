import Ember from 'ember';

export default Ember.Mixin.create({
  fetch(id) {
    const store = this.get('simpleStore');
    const type = this.get('type');
    const typeGrid = this.get('typeGrid');
    const detail = store.find(type, id);
    const grid = store.find(typeGrid, id);
    return store.find(type, id);
  }
});
