import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

var CategoryNewRoute = TabNewRoute.extend({
  repository: inject('category'),
  redirectRoute: 'admin.categories.index',
  module: 'category',
  templateModelField: Ember.computed(function() { return 'Category'; }),
  model(params) {
    let new_pk = parseInt(params.new_id, 10);
    let transition = arguments[1];
    let repository = this.get('repository');
    let search = transition.queryParams.search;
    let categories_children = repository.findCategoryChildren(search);
    let model = this.get('simpleStore').find('category', {new_pk: new_pk}).objectAt(0);
    if(!model){
      model = this.get('repository').create(new_pk);
    }
    return {
      model: model,
      categories_children: categories_children,
    };
  },
  setupController: function(controller, hash) {
    controller.set('model', hash.model);
    controller.set('categories_children', hash.categories_children);
  }
});

export default CategoryNewRoute;
