import Ember from 'ember';
import { many_to_many_extract } from 'bsrs-components/repository/many-to-many';

var extract_tree = function(model, store) {
  let parent_id;
  let parent = model.parent;
  if (parent) {
    parent_id = parent.id ? parent.id : parent;
  }
  delete model.parent;
  return [parent_id];
};

var CategoryDeserializer = Ember.Object.extend({
  deserialize(response, options) {
    if (typeof options === 'undefined') {
      this.deserialize_list(response);
    } else {
      return this.deserialize_single(response, options);
    }
  },
  deserialize_single(response, id) {
    const store = this.get('simpleStore');
    const existing = store.find('category', id);
    let category = existing;
    let children_json = response.children;
    delete response.children;
    [response.parent_id] = extract_tree(response, store);
    response.detail = true;
    category = store.push('category', response);
    if(children_json){
      let [m2m_children, children, server_sum] = many_to_many_extract(children_json, store, category, 'category_children', 'category_pk', 'category', 'children_pk');
      children.forEach((cat) => {
        store.push('category', cat);
      });
      m2m_children.forEach((m2m) => {
        store.push('category-children', m2m);
      });
      category = store.push('category', {id: response.id, category_children_fks: server_sum});
    }
    category.save();
    return category;
  },
  deserialize_list(response) {
    const store = this.get('simpleStore');
    response.results.forEach((model) => {
      const category = store.push('category-list', model);
    });
  }
});

export default CategoryDeserializer;
