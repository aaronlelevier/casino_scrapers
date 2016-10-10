import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

var CategorySingle = TabRoute.extend(FindById, {
  repository: inject('category'),
  i18n: Ember.inject.service(),
  redirectRoute: 'admin.categories.index',
  module: 'category',
  templateModelField: 'name',
  model(params) {
    const pk = params.category_id;
    const repository = this.get('repository');
    let category = repository.fetch(pk);
    /* MOBILE SPECIFIC */
    const hashComponents = [
      {'title': this.get('i18n').t('admin.category.section.details'), 'component': 'categories/detail-section', active: 'active'},
      {'title': this.get('i18n').t('admin.category.section.cost'), 'component': 'categories/cost-section'},
      {'title': this.get('i18n').t('admin.category.section.other'), 'component': 'categories/other-section'},
    ];
    return this.findByIdScenario(category, pk, {hashComponents:hashComponents, repository: repository});
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  },
});

export default CategorySingle;
