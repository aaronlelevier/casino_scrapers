import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

var DtdNewRoute = Ember.Route.extend({
    tabList: Ember.inject.service(),
    repository: inject('dtd'),
    redirectRoute: Ember.computed(function() { return 'dtds.index'; }),
    modelName: Ember.computed(function() { return 'dtd'; }),
    templateModelField: Ember.computed(function() { return 'Definition'; }),
    transitionCallback() { 
        const store = this.get('store');
        store.push('dtd-header', {id: 1, showingList:true, showingDetail:true, showingPreview:true, detail_model:true});
    },
    model(params) {
        const new_pk = parseInt(params.new_id, 10);
        const repository = this.get('repository');
        // let model = this.get('store').find('dtd', {new_pk: new_pk}).objectAt(0);
        // if(!model){
            let model = this.get('repository').create(new_pk);
        // }
        return {
            model: model,
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
            true,
            this.transitionCallback.bind(this),
            model_id
        );
    },
    renderTemplate(){
        this.render('dtds.new', {
            into: 'dtds',
            outlet: 'detail'
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
    },
    actions: {
        editDTD() {
           this.transitionTo('dtds.dtd', this.currentModel.model.get('id'));
        },
    }
});

export default DtdNewRoute;

