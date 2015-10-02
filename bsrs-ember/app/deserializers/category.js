import Ember from 'ember';

var extract_children = (children, store) => {
    let children_fks = [];
    //SCOTT: need to think about recursive calls or one level deep and pushing categories in the store
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
        let existing_category = store.find('category', id);
        if (!existing_category.get('id') || existing_category.get('isNotDirtyOrRelatedNotDirty')) {
            response.children_fks = extract_children(response.children, store);
            delete response.children;
            let category = store.push('category', response);
            category.save();
        }
    },
    deserialize_list(response) {
        let store = this.get('store');
        response.results.forEach((model) => {
            let existing_category = store.find('category', model.id);
            if (!existing_category.get('id') || existing_category.get('isNotDirtyOrRelatedNotDirty')) {
                let category = store.push('category', model);
                category.save();
            }
        });
    }
});

export default CategoryDeserializer;



