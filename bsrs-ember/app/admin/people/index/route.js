import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var set_filter_model_attrs = function(filterModel, query) {
    let columns = query ? query.split(',') : [];
    columns.forEach((pair) => {
        let attrs = pair.split(':');
        filterModel.set(attrs[0], attrs[1]);
    });
};

var PersonIndexRoute = Ember.Route.extend({
    init: function() {
        this.filterModel = Ember.Object.create();
        this._super();
    },
    repository: inject('person'),
    queryParams: {
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
        return repository.findWithQuery(query.page, query.sort, query.search, query.find);
    },
    setupController: function(controller, model) {
        controller.set('model', model);
        controller.set('filterModel', this.filterModel);
    }
});

export default PersonIndexRoute;
