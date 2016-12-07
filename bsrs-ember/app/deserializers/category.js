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
  deserialize(response, id) {
    if (id) {
      return this._deserializeSingle(response);
    } else {
      return this._deserializeList(response);
    }
  },
  _deserializeSingle(response) {
    const store = this.get('simpleStore');
    let children_json = response.children;
    delete response.children;
    [response.parent_id] = extract_tree(response, store);
    response.detail = true;
    let category = store.push('category', response);
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
  _deserializeList(response) {
    const store = this.get('simpleStore');
    const results = [];
    response.results.forEach((model) => {
      const category = store.push('category-list', model);
      results.push(category);
    });
    return results;
  }
});

export default CategoryDeserializer;
