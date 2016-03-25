import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

var CategorySingle = TabRoute.extend(FindById, {
    repository: inject('category'),
    redirectRoute: 'admin.categories.index',
    module: 'category',
    templateModelField: Ember.computed(function() { return 'name'; }),
    model(params) {
        const pk = params.category_id;
        const repository = this.get('repository');
        let category = repository.fetch(pk);
        return this.findByIdScenario(category, pk);
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
    },
});

export default CategorySingle;
