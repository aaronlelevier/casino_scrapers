import Ember from 'ember';

var extract_tree = function(model, store) {
    let children_fks = [];
    let children = model.children;
    if (children) {
        children.forEach((child_model) => {
            children_fks.push(child_model.id);
            delete child_model.parent;
            child_model.parent_id = model.id;
            store.push('category', child_model);
        });
    }
    let parent_id;
    let parent = model.parent;
    if (parent) {
        parent_id = parent.id ? parent.id : parent;
    }
    delete model.parent;
    delete model.children;
    return [children_fks, parent_id];
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
            let temp = response.children_fks;
            [response.children_fks, response.parent_id] = extract_tree(response, store);
            if(response.children_fks.length < 1) {
                response.children_fks = temp;
            }
            let category = store.push('category', response);
            category.save();
        }
    },
    deserialize_list(response) {
        let store = this.get('store');
        response.results.forEach((model) => {
            let existing_category = store.find('category', model.id);
            if (!existing_category.get('id') || existing_category.get('isNotDirtyOrRelatedNotDirty')) {
                [model.children_fks, model.parent_id] = extract_tree(model, store);
                let category = store.push('category', model);
                category.save();
            }
        });
    }
});

export default CategoryDeserializer;



