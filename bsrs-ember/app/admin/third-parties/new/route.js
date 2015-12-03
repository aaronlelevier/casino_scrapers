import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/new-route';

var ThirdPartyNewRoute = TabRoute.extend({
    repository: inject('third-party'),
    status_repo: inject('status'),
    redirectRoute: Ember.computed(function() { return 'admin.third-parties.index'; }),
    modelName: Ember.computed(function() { return 'third-party'; }),
    templateModelField: Ember.computed(function() { return 'ThirdParty'; }),
    model_fetch: Ember.computed(function() {
        return this.get('repository').create();
    }),
    model() {
        const model = this.get('model_fetch');
        const status_repo = this.get('status_repo');
        return Ember.RSVP.hash({
            model: model,
            statuses: status_repo.find()
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('statuses', hash.statuses);
    }
});

export default ThirdPartyNewRoute;
