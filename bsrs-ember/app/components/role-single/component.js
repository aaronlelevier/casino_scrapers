import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';

var RoleSingle = Ember.Component.extend({
    classNames: ['wrapper', 'form'],
    repository: inject('role'),
    store: injectStore('main'),
    tab(){
        return this.get('store').find('tab', this.get('model.id'));
    },
    actions: {
        saveRole() {
            var model = this.get('model'); 
            var repository = this.get('repository');
            repository.update(model).then(() => {
                this.sendAction('save', this.tab());
            });
        },
        deleteRole() {
            var model = this.get('model');
            var repository = this.get('repository');
            this.sendAction('delete', this.tab(), model, repository);
        },
        cancelRole() {
            this.sendAction('cancel', this.tab());
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

export default RoleSingle;
