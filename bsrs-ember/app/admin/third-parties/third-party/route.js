import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';

var ThirdPartyRoute = TabRoute.extend({
    repository: inject('third-party'),
    status_repo: inject('status'),
    redirectRoute: Ember.computed(function() { return 'admin.third-parties.index'; }),
    modelName: Ember.computed(function() { return 'third-party'; }),
    templateModelField: Ember.computed(function() { return 'name'; }),
    model(params) {
        const third_party_pk = params.third_party_id;
        const status_repo = this.get('status_repo');
        const repository = this.get('repository');
        let third_party = this.get('store').find('third-party', third_party_pk);
        if (!third_party.get('length') || third_party.get('isNotDirtyOrRelatedNotDirty')) { 
            third_party = repository.findById(third_party_pk);
        }
        return Ember.RSVP.hash({
            model: third_party,
            statuses: status_repo.find(),
        });

    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('statuses', hash.statuses);
    }
});

export default ThirdPartyRoute;
