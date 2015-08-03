import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend({
    classNames: ['wrapper', 'form'],
    repository: inject('role'),
    actions: {
        saveRole() {
            var model = this.get('model'); 
            var repository = this.get('repository');
            repository.update(model).then(() => {
                this.sendAction('saveRole');
            });
        },
        deleteRole() {
            var model = this.modelFor('admin.roles.role');
            // model.destroyRecord().then(() => {
            //   this.transitionTo('admin.people');
            // });
            this.transitionTo('admin.roles');
        },
        cancelRole() {
            this.sendAction('redirectUser');
        }
    }
});
