import Ember from 'ember';
import injectStore from 'bsrs-ember/utilities/store';

var BaseComponent = Ember.Component.extend({
    classNames: ['wrapper', 'form'],
    store: injectStore('main'),
    tab(){
        return this.get('store').find('tab', this.get('model.id'));
    },
    actions: {
        save() {
                var model = this.get('model'); 
                var repository = this.get('repository');
                repository.update(model).then(() => {
                    this.sendAction('save', this.tab());
                });
        },
        delete() {
            var model = this.get('model');
            var repository = this.get('repository');
            this.sendAction('delete', this.tab(), model, repository);
        },
        cancel() {
            this.sendAction('cancel', this.tab());
        },
    }
});

export default BaseComponent;

