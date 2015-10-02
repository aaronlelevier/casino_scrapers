import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Service.extend({
    store: inject('main'),
    createTab(doc_route, doc_type, id, templateModelField, redirect=undefined, newModel=false){
        this.get('store').push('tab', {
            id: id,
            doc_type: doc_type,
            doc_route: doc_route,
            templateModelField: templateModelField,
            redirect: redirect,
            newModel: newModel
        });
    },
    closeTab(id){
        this.get('store').remove('tab', id);
    }
});
