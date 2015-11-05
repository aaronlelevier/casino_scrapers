import Ember from 'ember';
import injectUUID from 'bsrs-ember/utilities/uuid';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';
import inject from 'bsrs-ember/utilities/inject';

var PersonNew = TabNewRoute.extend({
    uuid: injectUUID('uuid'),
    repository: injectRepo('person'),
    phone_number_type_repo: inject('phone-number-type'),
    redirectRoute: Ember.computed(function() { return 'admin.people.index'; }),
    modelName: Ember.computed(function() { return 'person'; }),
    templateModelField: Ember.computed(function() { return 'Person'; }),
    model() {
        let pk = this.get('uuid').v4();
        let repository = this.get('repository');
        let role_repo = this.get('role_repo');
        let roles = this.get('store').find('role');
        return Ember.RSVP.hash({
            model: this.get('store').push('person', {id: pk, new: true}),
            roles: roles
        });
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
