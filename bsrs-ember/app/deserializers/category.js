import Ember from 'ember';

var extract_children = (children, store) => {
    let children_fks = [];
    children.forEach((child_model) => {
        children_fks.push(child_model.id);
        store.push('category', child_model);
    });
    return children_fks;
};

var CategoryDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        let store = this.get('store');
        let exisiting_category = store.find('category', id);
        if (!exisiting_category.get('id') || exisiting_category.get('isNotDirtyOrRelatedNotDirty')) {
            response.children_fks = extract_children(response.children, store);
            delete response.children;
            let category = store.push('category', response);
            category.save();
        }
    },
    deserialize_list(response) {
        let store = this.get('store');
        response.results.forEach((model) => {
            let exisiting_category = store.find('category', model.id);
            if (!exisiting_category.get('id') || exisiting_category.get('isNotDirtyOrRelatedNotDirty')) {
                let category = store.push('category', model);
                category.save();
            }
        });
    }
});

export default CategoryDeserializer;



