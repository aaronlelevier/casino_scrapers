import Ember from 'ember';
import inject_uuid from 'bsrs-ember/utilities/uuid';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/new-route';

var ThirdPartyNewRoute = TabRoute.extend({
    uuid: inject_uuid('uuid'),
    repository: inject('third-party'),
    status_repo: inject('status'),
    redirectRoute: Ember.computed(function() { return 'admin.third-parties.index'; }),
    modelName: Ember.computed(function() { return 'third-party'; }),
    templateModelField: Ember.computed(function() { return 'ThirdParty'; }),
    model() {
        const pk = this.get('uuid').v4();
        const repository = this.get('repository');
        const model = this.get('store').push('third-party', {id: pk});
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
