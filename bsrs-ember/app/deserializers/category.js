import Ember from 'ember';

var extract_children = (children, store) => {
    let children_fks = [];
    children.forEach((child_model) => {
        children_fks.push(child_model.id);
        //possible to push its children in as well? question is how deep should we go?? recursive sol'n?
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
        response.children_fks = extract_children(response.children, store);
        delete response.children;
        let category = store.push('category', response);
        category.save();
    },
    deserialize_list(response) {
        let store = this.get('store');
        response.results.forEach((model) => {
            model.children_fks = extract_children(model.children, store);
            delete model.children;
            let category = store.push('category', model);
            category.save();
        });
    }
});

export default CategoryDeserializer;



