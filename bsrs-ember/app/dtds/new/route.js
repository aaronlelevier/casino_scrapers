import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

var DtdNewRoute = TabNewRoute.extend({
    repository: inject('dtd'),
    redirectRoute: Ember.computed(function() { return 'dtds.index'; }),
    modelName: Ember.computed(function() { return 'dtd'; }),
    templateModelField: Ember.computed(function() { return 'Definition'; }),
    model(params) {
        const store = this.get('store');
        store.push('dtd-header', {id: 1, showingList:true, showingDetail:true, showingPreview:true});
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

