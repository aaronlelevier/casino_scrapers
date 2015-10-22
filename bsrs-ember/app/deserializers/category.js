import Ember from 'ember';

var extract_tree = (model, store) => {
    let children_fks = [];
    let children = model.children;
    if (children) {
        //need to deserialize children with children_fks_pk and parent_id
        children.forEach((child_model) => {
            children_fks.push(child_model.id);
            store.push('category', child_model);
        });
    }
    let parent_fk;
    let parent = model.parent;
    if (parent) {
        parent_fk = parent;
    }
    delete model.parent;
    delete model.children;
    return [children_fks, parent_fk];
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
            [response.children_fks, response.parent_id] = extract_tree(response, store);
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



