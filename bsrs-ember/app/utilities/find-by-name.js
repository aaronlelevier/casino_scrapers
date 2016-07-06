import PromiseMixin from 'ember-promise/mixins/promise';

var findByName = function(url, search, page_size) {
  search = search ? search.trim() : search;
  if (search) {
    url += `?name__icontains=${search}`;
    if (page_size) {
      url += `&page_size=${page_size}`;
    }
    return PromiseMixin.xhr(url, 'GET').then((response) => {
      return response;
    });
  }
};

export default findByName;
