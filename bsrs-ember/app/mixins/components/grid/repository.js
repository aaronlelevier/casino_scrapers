import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';

const { run } = Ember;

var GridRepositoryMixin = Ember.Mixin.create({
    create(new_pk) {
        let created;
        const pk = this.get('uuid').v4();
        created = this.get('store').push(this.get('type'), {id: pk, new: true, new_pk: new_pk});
        return created;
    },
    insert(model) {
        return PromiseMixin.xhr(this.get('url'), 'POST', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
            model.saveRelated();
        });
    },
    delete(id) {
       return PromiseMixin.xhr(this.get('url') + id + '/', 'DELETE');
    },
    findCount() {
        var count_array = this.get('store').find(this.get('type')).toArray();
        var count = count_array.filter(function(m) {
            return m.get('new') === true;
        }).get('length');
        return count+1;
    },
    findWithQuery(page, sort, search, find, page_size) {
        let type = this.get('typeGrid');
        let url = this.get('url');
        const store = this.get('store');
        let deserializer = this.get('deserializer');
        page = page || 1;
        let endpoint = url + '?page=' + page;
        if (sort && sort !== 'id' && sort.indexOf('.') < 0) {
            endpoint = endpoint + '&ordering=' + sort;
        }else if (sort && sort !== 'id'){
            endpoint = endpoint + '&ordering=' + sort.replace(/\./g, '__').replace(/translated_name/g, 'name');
        }
        if (search && search !== '') {
            endpoint = endpoint + '&search=' + encodeURIComponent(search);
        }
        if (page_size && page_size !== '') {
            endpoint = endpoint + '&page_size=' + page_size;
        }
        if (find && find !== '') {
            let finds = find.split(',');
            finds.forEach((data) => {
                let params = data.split(':');
                let key = params[0] || '';
                let value = params[1];
                let field = key.replace('-', '_').replace('.', '__').replace('translated_name', 'name').replace('[', '__').replace(']', '');
                endpoint = endpoint + '&' + field + '__icontains=' + encodeURIComponent(value);
            });
        }
        const garbage_collection = this.get('garbage_collection') || [];
        garbage_collection.forEach((type) => {
            store.clear(type);
        });
        return PromiseMixin.xhr(endpoint).then((response) => {
            const grid = deserializer.deserialize(response);
            grid.set('isLoaded', true);
            grid.set('count', response.count);
            return grid;
        });
    }
});

export default GridRepositoryMixin;
