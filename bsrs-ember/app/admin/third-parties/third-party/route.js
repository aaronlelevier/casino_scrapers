import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';

var ThirdPartyRoute = TabRoute.extend({
    repository: inject('third-party'),
    all_statuses: inject('status'),
    redirectRoute: Ember.computed(function() { return 'admin.third-parties.index'; }),
    modelName: Ember.computed(function() { return 'third-party'; }),
    templateModelField: Ember.computed(function() { return 'name'; }),
    model(params) {
        let third_party_pk = params.third_party_id;
        let all_statuses = this.get('all_statuses');
        let repository = this.get('repository');
        let third_party = this.get('store').find('third-party', third_party_pk);
        if (!third_party.get('length') || third_party.get('isNotDirtyOrRelatedNotDirty')) { 
            third_party = repository.findById(third_party_pk);
            // debugger;
        }
        return Ember.RSVP.hash({
            model: third_party,
            all_statuses: all_statuses.find()
        });

    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('all_statuses', hash.all_statuses);
    }
});

export default ThirdPartyRoute;
