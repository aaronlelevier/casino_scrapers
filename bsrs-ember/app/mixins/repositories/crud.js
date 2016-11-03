import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';

export default Ember.Mixin.create({
  fetch(id) {
    const store = this.get('simpleStore');
    const type = this.get('type');
    const typeGrid = this.get('typeGrid');
    const detail = store.find(type, id);
    const grid = store.find(typeGrid, id);
    return store.find(type, id);
  },
  create(new_pk, options={}) {
    let created;
    const pk = this.get('uuid').v4();
    /* jshint ignore:start */
    created = this.get('simpleStore').push(this.get('type'), {id: pk, new: true, new_pk: new_pk, ...options});
    /* jshint ignore:end */
    return created;
  },
  insert(model) {
    return PromiseMixin.xhr(this.get('url'), 'POST', {data: JSON.stringify(model.serialize())}).then(() => {
      model.set('new', undefined);
      model.set('new_pk', undefined);
      model.save();
      model.saveRelated();
    });
  },
  update(model) {
    return PromiseMixin.xhr(this.get('url') + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
      model.save();
      model.saveRelated();
    });
  },
  delete(id) {
    const type = this.get('type');
    return PromiseMixin.xhr(this.get('url') + id + '/', 'DELETE').then(() => {
      /* remove from single / grid cache */
      this.get('simpleStore').remove(type, id);
      this.get('simpleStore').remove(`${type}-list`, id);
    });
  },
});
