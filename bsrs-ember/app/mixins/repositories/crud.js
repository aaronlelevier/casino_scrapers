import Ember from 'ember';

export default Ember.Mixin.create({
  fetch(id) {
    const store = this.get('store');
    const type = this.get('type');
    const typeGrid = this.get('typeGrid');
    const detail = store.find(type, id);
    const grid = store.find(typeGrid, id);
    //TODO: need Ember.assign for this to prevent the model that is returned to be not dirty
    // if(grid.get('id') && !detail.get('id')){;
    //     return store.push(type, {id: grid.get('id')});
    // }
    return store.find(type, id);
  }
});

