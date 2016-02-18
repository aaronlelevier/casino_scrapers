import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';
import inject from 'bsrs-ember/utilities/inject';

var PersonNew = TabNewRoute.extend({
    repository: injectRepo('person'),
    redirectRoute: Ember.computed(function() { return 'admin.people.index'; }),
    modelName: Ember.computed(function() { return 'person'; }),
    templateModelField: Ember.computed(function() { return 'Person'; }),
    model(params) {
        const new_pk = parseInt(params.new_id, 10);
        const roles = this.get('store').find('role');
        let model = this.get('store').find('person', {new_pk: new_pk}).objectAt(0);
        if(!model){
            model = this.get('repository').create(new_pk);
        }
        return {
            model: model,
            roles: roles,
            locales: this.get('store').find('locale')
        };
    },
    setupController(controller, hash) {
        controller.set('model', hash.model);
        controller.set('roles', hash.roles);
        controller.set('locales', hash.locales);
    },
    actions: {
        editPerson() {
           this.transitionTo('admin.people.person', this.currentModel.model.get('id'));
        },
    }
});

export default PersonNew;
