import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import PriorityMixin from 'bsrs-ember/mixins/route/priority';
import StatusMixin from 'bsrs-ember/mixins/route/status';

export default TabRoute.extend(PriorityMixin, StatusMixin, {
    repository: inject('dtd'),
    redirectRoute: Ember.computed(function() { return 'dtds.index'; }),
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
            model: dtd,
            priorities: this.get('priorities'),
            statuses: this.get('statuses')
        };
    },
    renderTemplate(){
        this.render('dtds.dtd', {
            into: 'dtds',
            outlet: 'wat'
        });
        this.render('components.dtds.dtd-preview', {
            into: 'dtds',
            outlet: 'foo'
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('priorities', hash.priorities);
        controller.set('statuses', hash.statuses);
    },
});



