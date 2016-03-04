import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

var DtdNewRoute = TabNewRoute.extend({
    repository: inject('dtd'),
    redirectRoute: Ember.computed(function() { return 'dtds.index'; }),
    modelName: Ember.computed(function() { return 'dtd'; }),
    templateModelField: Ember.computed(function() { return 'Definition'; }),
    model(params) {
        let new_pk = parseInt(params.new_id, 10);
        let repository = this.get('repository');
        // let model = this.get('store').find('dtd', {new_pk: new_pk}).objectAt(0);
        // if(!model){
            let model = this.get('repository').create(new_pk);
        // }
        return {
            model: model,
        };
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
    }
});

export default DtdNewRoute;

