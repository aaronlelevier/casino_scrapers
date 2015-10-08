import Ember from 'ember';
import set_filter_model_attrs from 'bsrs-ember/utilities/filter-model-attrs';

var GridViewRoute = Ember.Route.extend({
    init: function() {
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
    model: function(params, transition) {
        let query = transition.queryParams;
        let repository = this.get('repository');
        set_filter_model_attrs(this.filterModel, query.find);
        return repository.findWithQuery(query.page, query.sort, query.search, query.find, query.page_size);
    },
    setupController: function(controller, model) {
        controller.set('model', model);
        controller.set('filterModel', this.filterModel);
    }
});

export default GridViewRoute;
