import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

const PAGE_SIZE = config.APP.PAGE_SIZE;
const { run } = Ember;

var GridRepositoryMixin = Ember.Mixin.create({
  error: Ember.inject.service(),
  _totalPages: 0,
  _currentPage: 0,
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
      /* remove from single / grid cache */
      this.get('simpleStore').remove(type, id);
      this.get('simpleStore').remove(`${type}-list`, id);
    });
  },
  findCount() {
    var count_array = this.get('simpleStore').find(this.get('type')).toArray();
    var count = count_array.filter(function(m) {
      return m.get('new') === true;
    }).get('length');
    return count+1;
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
  /*
  * Once currentPage is >= to totalPages don't fetch another page
  * If totalPages === 0, then always fetch more (initial App state)...need to think about how filter will affect this
  */
  _canLoadMore() {
    const totalPages = this.get('_totalPages');
    const currentPage = this.get('_currentPage');
    return totalPages ? currentPage < totalPages : true;
  },
  //TODO: consolidate both find methods
  findWithQueryMobile(page, search, find, page_size) {
    const type = this.get('typeGrid');
    const store = this.get('simpleStore');
    /* START if the currentPage is NOT less than totalPages, then bail */
    if (!this._canLoadMore()) {
      return [store.find(type), true];
    }
    this.incrementProperty('_currentPage');
    /* END */
    const deserializer = this.get('deserializer');
    page = page || 1;
    let endpoint = this.modifyEndpoint(page, search, find, page_size);

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
      deserializer.deserialize(response);
      all.set('isLoaded', true);
      const count = response.count;
      all.set('count', count);
      this.set('_totalPages', Math.ceil(count/PAGE_SIZE)); //used to determine how many pages
      run(() => {
        store.push('grid-count', { id: 1, count:count });
      });
    }, (xhr) => {
      this.get('error').transToError();
    });
    return [all];
  },
  findWithQuery(page, search, find, page_size, sort) {
    const type = this.get('typeGrid');
    const store = this.get('simpleStore');
    const deserializer = this.get('deserializer');
    page = page || 1;
    let endpoint = this.modifyEndpoint(page, search, find, page_size, sort);

    const garbage_collection = this.get('garbage_collection') || [];
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
