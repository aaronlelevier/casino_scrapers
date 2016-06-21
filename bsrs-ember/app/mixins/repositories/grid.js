import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';

const { run } = Ember;

var GridRepositoryMixin = Ember.Mixin.create({
  error: Ember.inject.service(),
  /* determines new_pk passed to route */
  findCount() {
    var count_array = this.get('simpleStore').find(this.get('type')).toArray();
    var count = count_array.filter(function(m) {
      return m.get('new') === true;
    }).get('length');
    return count+1;
  },
  mobileSearch(searchValue) {
    return PromiseMixin.xhr(`${this.get('url')}?search=${searchValue}`).then((response) => {
      return response.results;
    });
  },
  modifyEndpoint(page, search, find, page_size, sort) {
    let url = this.get('url');
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
    return endpoint;
  },
  /* Non Optimistic Rendering: Mobile */
  findWithQueryMobile(page, search, find) {
    const type = this.get('typeGrid');
    const store = this.get('simpleStore');
    const deserializer = this.get('deserializer');
    page = page || 1;
    let endpoint = this.modifyEndpoint(page, search, find);
    return PromiseMixin.xhr(endpoint).then((response) => {
      deserializer.deserialize(response);
      const all = store.find(type);
      /* further processing on array proxy */
      all.set('isLoaded', true);
      const count = response.count;
      all.set('count', count);
      run(() => {
        store.push('grid-count', { id: 1, count:count });
      });
      return all;
    }, (xhr) => {
      this.get('error').transToError();
    });
  },
  /* Optimistic Rendering */
  findWithQuery(page, search, find, page_size, sort) {
    const type = this.get('typeGrid');
    const store = this.get('simpleStore');
    const deserializer = this.get('deserializer');
    page = page || 1;
    let endpoint = this.modifyEndpoint(page, search, find, page_size, sort);

    const all = store.find(type);
    let grid_count = store.find('grid-count', 1);
    if(!grid_count.get('content')){
      /* sets a default count while the payload is being deserialized */
      run(() => {
        grid_count = store.push('grid-count', {id: 1, count: 100});
      });
    }
    all.set('count', grid_count.get('count'));
    PromiseMixin.xhr(endpoint).then((response) => {
      const garbage_collection = this.get('garbage_collection') || [];
      garbage_collection.forEach((type) => {
        run(() => {
          store.clear(type);
        });
      });
      deserializer.deserialize(response);
      all.set('isLoaded', true);
      const count = response.count;
      all.set('count', count);
      run(() => {
        store.push('grid-count', { id: 1, count:count });
      });
    }, (xhr) => {
      this.get('error').transToError();
    });
    return all;
  }
});

export default GridRepositoryMixin;
