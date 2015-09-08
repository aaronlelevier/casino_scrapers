import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var PersonIndexRoute = Ember.Route.extend({
    repository: inject('person'),
    queryParams: {
        page: {
            refreshModel: true
        },
        sort: {
            refreshModel: true
        },
        search: {
            refreshModel: true
        }
    },
    model: function(params, transition) {
        var query = transition.queryParams;
        var repository = this.get('repository');
        return repository.findWithQuery(query.page, query.sort, query.search);
    }
});

export default PersonIndexRoute;
