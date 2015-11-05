import Ember from 'ember';
import inject_uuid from 'bsrs-ember/utilities/uuid';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/new-route';

var ThirdPartyNewRoute = TabRoute.extend({
    uuid: inject_uuid('uuid'),
    repository: inject('third-party'),
    all_statuses: inject('status'),
    redirectRoute: Ember.computed(function() { return 'admin.third-parties.index'; }),
    modelName: Ember.computed(function() { return 'third-party'; }),
    templateModelField: Ember.computed(function() { return 'ThirdParty'; }),
    model() {
        let pk = this.get('uuid').v4();
        let repository = this.get('repository');
        let model = this.get('store').push('third-party', {id: pk});
        let all_statuses = this.get('all_statuses');
        return Ember.RSVP.hash({
            model: model,
            all_statuses: all_statuses.find()
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('all_statuses', hash.all_statuses);
    }
});

export default ThirdPartyNewRoute;
