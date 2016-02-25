import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';

export default TabRoute.extend({
    repository: inject('dtd'),
    redirectRoute: Ember.computed(function() { return 'admin.dtds.index'; }),
    modelName: Ember.computed(function() { return 'dtd'; }),
    templateModelField: Ember.computed(function() { return 'key'; }),
    model(params){
        const pk = params.dtd_id;
        const repository = this.get('repository');
        let dtd = repository.fetch(pk);
        // if(!dtd.get('length') || dtd.get('isNotDirtyOrRelatedNotDirty')){
            dtd = repository.findById(pk);
        // }
        return {
            model: dtd
        };
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
    },
});



