import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

var CategorySingle = TabRoute.extend(FindById, {
  repository: inject('category'),
  redirectRoute: 'admin.categories.index',
  module: 'category',
  templateModelField: 'name',
  model(params) {
    const pk = params.category_id;
    const repository = this.get('repository');
    let category = repository.fetch(pk);
    return this.findByIdScenario(category, pk, {repository: repository});
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  },
});

export default CategorySingle;
