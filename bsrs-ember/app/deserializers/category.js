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
            return this.deserialize_list(response);
        } else {
            return this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        const store = this.get('store');
        const existing_category = store.find('category', id);
        let category = existing_category;
        if (!existing_category.get('id') || existing_category.get('isNotDirtyOrRelatedNotDirty')) {
            let temp = response.children_fks || [];
            [response.children_fks, response.parent_id] = extract_tree(response, store);
            if(response.children_fks.length < 1) {
                //if no children, check if only children_fks was passed down
                response.children_fks = temp;
            }
            response.detail = true;
            category = store.push('category', response);
            store.push('category', {id: category.get('id'), children_fks: response.children_fks, previous_children_fks: response.children_fks});
            category.save();
        }
        return category;
    },
    deserialize_list(response) {
        const store = this.get('store');
        const return_array = [];
        response.results.forEach((model) => {
            const category = store.push('category-list', model);
            return_array.push(category);
        });
        return return_array;
    }
});

export default CategoryDeserializer;



