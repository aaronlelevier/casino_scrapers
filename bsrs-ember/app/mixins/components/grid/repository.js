import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';

var run = Ember.run;

var GridRepositoryMixin = Ember.Mixin.create({
    create(new_pk) {
        let created;
        const pk = this.get('uuid').v4();
        run(() => {
            created = this.get('store').push(this.get('type'), {id: pk, new: true, new_pk: new_pk});
        });
        return created;
    },
    insert(model) {
        return PromiseMixin.xhr(this.get('url'), 'POST', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
            model.saveRelated();
        });
    },
    findCount() {
        var count_array = this.get('store').find(this.get('type')).toArray();
        var count = count_array.filter(function(m) {
            return m.get('new') === true;
        }).get('length');
        return count+1;
    },
    findWithQuery(page, sort, search, find, page_size, person) {
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
        const all = this.filter ? this.filter(person) : store.find(type);
        PromiseMixin.xhr(endpoint).then((response) => {
            all.set('isLoaded', true);
            all.set('count', response.count);
            deserializer.deserialize(response);
        });
        return all;
    }
});

export default GridRepositoryMixin;
