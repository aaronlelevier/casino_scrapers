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
        return repository.findWithQuery(query.page, query.sort, query.search, query.find);
    }
});

export default PersonIndexRoute;
