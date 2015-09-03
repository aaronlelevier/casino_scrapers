import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var PersonIndexRoute = Ember.Route.extend({
    repository: inject('person'),
    model: function(params, transition) {
        var query_params = transition.queryParams;
        if (!query_params.search) {
            query_params.search = null;
        }
        var repository = this.get('repository');
        var model = repository.find();
        return Ember.RSVP.hash({
            model: model,
            search: query_params.search
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('search', hash.search);
    },
});

export default PersonIndexRoute;
