import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';

const { run } = Ember;

var GridRepositoryMixin = Ember.Mixin.create({
  error: Ember.inject.service(),
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
      model.save();
      model.saveRelated();
    }, (xhr) => {
      this.get('error').transToError(this.get('errorUrl'));
    });
  },
  delete(id) {
    const type = this.get('type');
    return PromiseMixin.xhr(this.get('url') + id + '/', 'DELETE').then(() => {
      this.get('simpleStore').remove(type, id);
    });
  },
  findCount() {
    var count_array = this.get('simpleStore').find(this.get('type')).toArray();
    var count = count_array.filter(function(m) {
      return m.get('new') === true;
    }).get('length');
    return count+1;
  },
  findWithQuery(page, sort, search, find, page_size) {
    const type = this.get('typeGrid');
    let url = this.get('url');
    const store = this.get('simpleStore');
    const deserializer = this.get('deserializer');
    page = page || 1;
    let endpoint = url + '?page=' + page;
    if(sort && sort !== 'id' && sort.indexOf('.') < 0){
      endpoint = endpoint + '&ordering=' + sort;
    }else if(sort && sort !== 'id'){
      endpoint = endpoint + '&ordering=' + sort.replace(/\./g, '__').replace(/translated_name/g, 'name');
    }
    if(search && search !== ''){
      endpoint = endpoint + '&search=' + encodeURIComponent(search);
    }
    if(page_size && page_size !== ''){
      endpoint = endpoint + '&page_size=' + page_size;
    }
    if(find && find !== ''){
      let finds = find.split(',');
      finds.forEach((data) => {
        const params = data.split(':');
        const key = params[0] || '';
        const value = params[1];
        const field = key.replace('-', '_').replace('.', '__').replace('translated_name', 'name').replace('[', '__').replace(']', '');
        endpoint = endpoint + '&' + field + '__icontains=' + encodeURIComponent(value);
      });
    }
    const garbage_collection = this.get('garbage_collection') || [];
    const all = store.find(type);
    let grid_count = store.find('grid-count', 1);
    if(!grid_count.get('content')){
      grid_count = store.push('grid-count', {id: 1, count: 100});
    }
    /* sets a default count while the payload is being deserialized */
    all.set('count', grid_count.get('count'));
    PromiseMixin.xhr(endpoint).then((response) => {
      garbage_collection.forEach((type) => {
        store.clear(type);
      });
      deserializer.deserialize(response);
      all.set('isLoaded', true);
      const count = response.count;
      all.set('count', count);
      store.push('grid-count', { id: 1, count:count });
    }, (xhr) => {
      this.get('error').transToError();
    });
    return all;
  }
});

export default GridRepositoryMixin;
