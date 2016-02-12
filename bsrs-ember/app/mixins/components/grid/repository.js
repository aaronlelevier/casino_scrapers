import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';

const { run } = Ember;

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
        let type = this.get('type');
        let url = this.get('url');
        let store = this.get('store');
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
            finds.forEach(function(data) {
                let params = data.split(':');
                let key = params[0] || '';
                let value = params[1];
                let field = key.replace('-', '_').replace('.', '__').replace('translated_name', 'name').replace('[', '__').replace(']', '');
                endpoint = endpoint + '&' + field + '__icontains=' + encodeURIComponent(value);
            });
        }
        let ancillary_processing = this.get('ancillary_processing') || [];
        let type_related_m2m = this.get('type_related_m2m') || [];
        let type_related_join = this.get('type_related_join') || [];
        const related_m2m_pk_mapping = this.get('related_m2m_pk_mapping');
        return PromiseMixin.xhr(endpoint).then((response) => {
            //TODO: turn this into a service and unit test.  Only acceptance tests right now
            const all = store.find(type);
            const clean_cache = all.filter((model) => {
                return model.get('grid') && !model.get('detail') && model.get('isNotDirtyOrRelatedNotDirty');
            });
            //clear models that are still around from previous grid so they are not dirty
            ancillary_processing.forEach((type) => {
                const ancillary_gc = store.find(type);
                const remove_ancillary = ancillary_gc.filter((model) => {
                    return model.get('grid') && !model.get('detail')
                });
                remove_ancillary.forEach((model) => {
                    model.removeRecord(); 
                });
            });
            clean_cache.forEach((model) => {
                //m2m
                type_related_m2m.forEach((type) => {
                    const relateds = store.find(type);
                    const related_clear = relateds.filter((related_model) => {
                        return related_model.get(related_m2m_pk_mapping) === model.get('id');
                    });
                    related_clear.forEach((related) => {
                        related.removeRecord(); 
                    });
                }); 
                //join
                type_related_join.forEach((type) => {
                    const relateds = store.find(type);
                    const related_clear = relateds.filter((related_model) => {
                        return related_model.get('grid') && !related_model.get('detail'); 
                    });
                    related_clear.forEach((related) => {
                        related.removeRecord(); 
                    });
                });
                const found_model = store.find(type, model.get('id'));
                if(found_model){ found_model.removeRecord(); }
            });
            const grid = deserializer.deserialize(response);
            grid.set('isLoaded', true);
            grid.set('count', response.count);
            return grid;
        });
    }
});

export default GridRepositoryMixin;
