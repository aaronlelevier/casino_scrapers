import Ember from 'ember';
import injectUUID from 'bsrs-ember/utilities/uuid';
import TabRoute from 'bsrs-ember/route/tab/new-route';
import inject from 'bsrs-ember/utilities/inject';

var PersonNew = TabRoute.extend({
    uuid: injectUUID('uuid'),
    phone_number_type_repo: inject('phone-number-type'),
    redirectRoute: Ember.computed(function() { return 'admin.people.index'; }),
    modelName: Ember.computed(function() { return 'person'; }),
    templateModelField: Ember.computed(function() { return 'Person'; }),
    model() {
        var pk = this.get('uuid').v4();
        var role_repo = this.get('role_repo');
        var roles = this.get('store').find('role');
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
