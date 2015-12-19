import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/new-route';

var ThirdPartyNewRoute = TabRoute.extend({
    repository: inject('third-party'),
    status_repo: inject('status'),
    redirectRoute: Ember.computed(function() { return 'admin.third-parties.index'; }),
    modelName: Ember.computed(function() { return 'third-party'; }),
    templateModelField: Ember.computed(function() { return 'ThirdParty'; }),
    model(params) {
        const status_repo = this.get('status_repo');
        let model = this.get('store').find('third-party', {id: params.new_id}).objectAt(0);
        if(!model){
            model = this.get('repository').create(parseInt(params.new_id));
        }
        return {
            model: model,
            statuses: status_repo.find()
        };
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('statuses', hash.statuses);
    }
});

export default ThirdPartyNewRoute;
