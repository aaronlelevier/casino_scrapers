import Ember from 'ember';
import injectUUID from 'bsrs-ember/utilities/uuid';
import inject from 'bsrs-ember/utilities/inject';
import NewRollbackModalMixin from 'bsrs-ember/mixins/route/rollback/new';

export default Ember.Route.extend(NewRollbackModalMixin, {
    uuid: injectUUID('uuid'),
    phone_number_type_repo: inject('phone-number-type'),
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
        redirectUser() {
            this.transitionTo('admin.people');
        }
    }
});
