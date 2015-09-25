import Ember from 'ember';
import injectUUID from 'bsrs-ember/utilities/uuid';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
    uuid: injectUUID('uuid'),
    phone_number_type_repo: inject('phone-number-type'),
    tabList: Ember.inject.service(),
    model() {
        var pk = this.get('uuid').v4();
        var role_repo = this.get('role_repo');
        var roles = this.get('store').find('role');
        this.get('tabList').createTab(this.routeName, 'person', pk, 'admin.people.index', true);
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
