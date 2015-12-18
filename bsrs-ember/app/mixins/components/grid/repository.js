import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';

var GridRepositoryMixin = Ember.Mixin.create({
    findWithQuery(page, sort, search, find, page_size) {
        let type = this.get('type');
        let url = this.get('url');
        let store = this.get('store');
        let deserializer = this.get('deserializer');

        page = page || 1;
        let endpoint = url + '?page=' + page;
        if (sort && sort !== 'id' && sort.indexOf('.') < 0) {
            endpoint = endpoint + '&ordering=' + sort;
        }else if (sort && sort !== 'id'){
            endpoint = endpoint + '&related_ordering=' + sort.replace(/\./g, '__').replace(/translated_name/g, 'name');
        }
        if (search && search !== '') {
            endpoint = endpoint + '&search=' + encodeURIComponent(search);
        }
        if (page_size && page_size !== '') {
            endpoint = endpoint + '&page_size=' + page_size;
        }
        if (find && find !== '') {
            let finds = find.split(',');
            finds.forEach(function(data) {
                let params = data.split(':');
                let key = params[0] || '';
                let value = params[1];
                let field = key.replace('-', '_').replace('.', '__').replace('translated_name', 'name').replace('[', '__').replace(']', '');
                endpoint = endpoint + '&' + field + '__icontains=' + encodeURIComponent(value);
            });
        }
        let all = store.find(type);
        PromiseMixin.xhr(endpoint).then((response) => {
            all.set('isLoaded', true);
            all.set('count', response.count);
            deserializer.deserialize(response);
        });
        return all;
    }
});

export default GridRepositoryMixin;
