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
            var model = this.get('model');
            var repository = this.get('repository');
            repository.delete(model.get('id'));
            this.sendAction('redirectUser');
        },
        cancelRole() {
            this.sendAction('redirectUser');
        },
        changed(model, val) {
            Ember.run(() => {
                model.set('role_type', val);
            });
        },
        changedLocLevel(model, val) {
            Ember.run(() => {
                model.set('location_level', val);
            });
        },
    }
});
