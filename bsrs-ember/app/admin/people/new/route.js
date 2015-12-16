import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';
import inject from 'bsrs-ember/utilities/inject';

var PersonNew = TabNewRoute.extend({
    repository: injectRepo('person'),
    redirectRoute: Ember.computed(function() { return 'admin.people.index'; }),
    modelName: Ember.computed(function() { return 'person'; }),
    templateModelField: Ember.computed(function() { return 'Person'; }),
    model_fetch: Ember.computed(function() {
        return this.get('repository').create();
    }),
    model() {
        const roles = this.get('store').find('role');
        const model = this.get('model_fetch');
        return {
            model: model,
            roles: roles
        };
    },
    setupController(controller, hash) {
        controller.set('model', hash.model);
        controller.set('roles', hash.roles);
    },
    actions: {
        editPerson() {
           this.transitionTo('admin.people.person', this.currentModel.model.get('id'));
        },
    }
});

export default PersonNew;
