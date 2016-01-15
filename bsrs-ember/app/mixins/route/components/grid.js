import Ember from 'ember';
import set_filter_model_attrs from 'bsrs-ember/utilities/filter-model-attrs';
import inject from 'bsrs-ember/utilities/inject';

var nameRoute = function(route) {
    return route.get('constructor.ClassMixin.ownerConstructor').toString();
};

var GridViewRoute = Ember.Route.extend({
    pagination: Ember.inject.service(),
    filtersetRepository: inject('filterset'),
    init() {
        this.filterModel = Ember.Object.create();
        this._super();
    },
    queryParams: {
        page_size: {
            refreshModel: true
        },
        page: {
            refreshModel: true
        },
        sort: {
            refreshModel: true
        },
        find: {
            refreshModel: true
        },
        search: {
            refreshModel: true
        }
    },
    model(params, transition) {
        let filtersetRepository = this.get('filtersetRepository');
        let filtersets = filtersetRepository.fetch();
        let name = nameRoute(this);
        let query = transition.queryParams;
        let page = parseInt(query.page, 10) || 1;
        let repository = this.get('repository');
        let requested = this.get('pagination').requested(name, page);
        set_filter_model_attrs(this.filterModel, query.find);
        let model = repository.findWithQuery(query.page, query.sort, query.search, query.find, query.page_size);
        const count = repository.findCount();
        return {count: count, model: model, requested: requested, filtersets: filtersets};
    },
    setupController: function(controller, hash) {
        controller.set('count', hash.count);
        controller.set('model', hash.model);
        controller.set('requested', hash.requested);
        controller.set('filterModel', this.filterModel);
        controller.set('filtersets', hash.filtersets);
    },
    actions: {
        apply_filterset: function(route, params) {
            params.values['page'] = 1;
            params.queryParams = params.values;
            this.transitionTo(route, params);
        }
    }
});

export default GridViewRoute;
