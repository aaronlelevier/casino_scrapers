import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import PriorityMixin from 'bsrs-ember/mixins/route/priority';
import StatusMixin from 'bsrs-ember/mixins/route/status';

export default Ember.Route.extend(PriorityMixin, StatusMixin, {
    repository: inject('dtd'),
    redirectRoute: Ember.computed(function() { return 'dtds.index'; }),
    modelName: Ember.computed(function() { return 'dtd'; }),
    templateModelField: Ember.computed(function() { return 'key'; }),
    transitionCallback() { 
        const store = this.get('store');
        store.push('dtd-header', {id: 1, showingList:true, showingDetail:false, showingPreview:false});
    },
    tabList: Ember.inject.service(),
    model(params){
        const store = this.get('store');
        // store.push('dtd-header', {id: 1, showingList:true, showingDetail:true, showingPreview:true, detail_model:true});
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
    afterModel(model, transition) {
        const store = this.get('store');
        let model_id = model.model ? model.model.get('id') : model.get('id');
        let id = 'dtd123';
        store.push('dtd', {id: model_id, singleTabId: id});
        this.get('tabList').createTab(id,
            this.routeName,
            this.get('modelName'),
            this.get('templateModelField'),
            this.get('redirectRoute'),
            false,
            this.transitionCallback.bind(this),
            model_id
        );
    },
    renderTemplate(){
        this.render('dtds.dtd', {
            into: 'dtds',
            outlet: 'detail'
        });
        this.render('components.dtds.dtd-preview', {
            into: 'dtds',
            outlet: 'preview'
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('priorities', hash.priorities);
        controller.set('statuses', hash.statuses);
    },
});



