import Ember from 'ember';
import { many_to_many_extract } from 'bsrs-components/repository/many-to-many';

const { run, get } = Ember;

var CategoriesMixin = Ember.Mixin.create({
  category_names: Ember.computed('sorted_categories.[]', function() {
    const sorted_categories = get(this, 'sorted_categories') || [];
    const names = sorted_categories.map((category) => {
      return get(category, 'name');
    }).join(' &#8226; ');
    return Ember.String.htmlSafe(names);
  }).readOnly(),
  model_categories_no_filter: Ember.computed(function() {
    return get(this, 'simpleStore').find('model-category').filterBy('model_pk', this.get('id'));
  }).readOnly(),
  /*
   * this method is used for on the fly validation check to see if at end of cat tree
   * @param {object} category - this is the parent passed in from the ticket-categories validator and the child if recursive func passes child
   * Need to figure out why two if statements are there
  */
  construct_category_tree(category, child_nodes=[]) {
    child_nodes.push(category);
    const children = category ? category.get('children') : [];
    if(get(children, 'length') === 0 && get(child_nodes, 'length') > 1) {
      return;
    }
    // if at end of category tree b/c no children, return last child node
    if(get(children, 'length') === 0) {
      return child_nodes.objectAt(0) ? child_nodes : undefined;
    }
    // children for this specific category
    const children_ids = children.mapBy('id');
    // loop through models categories and see if this specific category has children that are in the categories_ids array and return that index
    const index = get(this, 'categories_ids').reduce((found, category_pk) => {
      return found !== false ? found : children_ids.includes(category_pk) ? children_ids.indexOf(category_pk) : false;
    }, false);
    const child = children.objectAt(index);
    this.construct_category_tree(child, child_nodes);
    return child_nodes.filter((node) => {
      return node !== undefined;
    });
  },
  top_level_category: Ember.computed('categories.[]', function() {
    return get(this, 'categories').filter((category) => {
      return category.get('parent_id') === undefined || get(category, 'parent_id') === null;
    }).objectAt(0);
  }).readOnly(),
  leaf_category: Ember.computed('categories.[]', function() {
    const sorted_categories = get(this, 'sorted_categories') || [];
    return sorted_categories[sorted_categories.length-1];
  }).readOnly(),
  sorted_categories: Ember.computed('categories.[]', 'top_level_category', function() {
    return get(this, 'categories').sortBy('level');
  }),
  model_categories_with_removed: Ember.computed(function() {
    let filter = function(join_model) {
      return get(join_model, 'model_pk') === get(this, 'id');
    };
    return this.get('simpleStore').find('model-category', filter.bind(this));
  }).readOnly(),
  find_parent_nodes(child_pk, parent_ids=[]) {
    if (!child_pk) { return; }
    let child = get(this, 'simpleStore').find('category', child_pk);
    //TODO: check to see if only need to check for parent_id
    let parent_id = get(child, 'parent.id') || get(child, 'parent_id');
    if (parent_id) {
      parent_ids.push(parent_id);
    }
    this.find_parent_nodes(get(child, 'parent.id'), parent_ids);
    return parent_ids;
  },
  remove_categories_down_tree(category_pk) {
    let parent_ids = this.find_parent_nodes(category_pk);
    let store = get(this, 'simpleStore');
    let model_pk = get(this, 'id');
    let m2m_models = get(this, 'model_categories').filter((m2m) => {
      return get(m2m, 'model_pk') === model_pk && !parent_ids.includes(m2m.get('category_pk'));
    });
    m2m_models.forEach((m2m) => {
      run(() => {
        store.push('model-category', {id: m2m.get('id'), removed: true});
      });
    });
  },
  change_category_tree(category) {
    const store = get(this, 'simpleStore');
    let pushed_category = store.find('category', category.id);
    if(!pushed_category.get('content') || pushed_category.get('isNotDirtyOrRelatedNotDirty')){
      run(() => {
        const children_json = category.children;
        delete category.children;
        pushed_category = store.push('category', category);
        pushed_category.save();
        if(children_json){
          let [m2m_children, children, server_sum] = many_to_many_extract(children_json, store, pushed_category, 'category_children', 'category_pk', 'category', 'children_pk');
          children.forEach((cat) => {
            store.push('category', cat);
          });
          m2m_children.forEach((m2m) => {
            store.push('category-children', m2m);
          });
          pushed_category = store.push('category', {id: category.id, category_children_fks: server_sum});
        }
      });
      pushed_category.save();
    }
    const category_pk = category.id;
    const parent_ids = this.find_parent_nodes(category_pk);
    const model_pk = get(this, 'id');
    //remove all m2m join models that don't relate to this category pk down the tree
    const m2m_models = get(this, 'model_categories').filter((m2m) => {
      return m2m.get('model_pk') === model_pk && !parent_ids.includes(m2m.get('category_pk'));
    });
    m2m_models.forEach((m2m) => {
      run(() => {
        store.push('model-category', {id: get(m2m, 'id'), removed: true});
      });
    });
    //find old m2m models that might exist
    const matching_m2m = get(this, 'model_categories_with_removed').filter((m2m) => {
      return get(m2m, 'model_pk') === model_pk && category_pk === get(m2m, 'category_pk') && get(m2m, 'removed') === true;
    }).objectAt(0);
    if (matching_m2m) {
      run(() => {
        store.push('model-category', {id: matching_m2m.get('id'), removed: undefined});
      });
    }else{
      run(() => {
        store.push('model-category', {id: Ember.uuid(), model_pk: model_pk, category_pk: category_pk});
      });
    }
  },
  //TODO: add tests
  add_category(category_pk) {
    const model_pk = get(this, 'id');
    const store = get(this, 'simpleStore');
    run(() => {
      store.push('model-category', {id: Ember.uuid(), model_pk: model_pk, category_pk: category_pk});
    });
  },
});

export default CategoriesMixin;
