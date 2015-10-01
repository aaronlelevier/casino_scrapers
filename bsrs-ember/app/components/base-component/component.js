import Ember from 'ember';
import injectStore from 'bsrs-ember/utilities/store';

var BaseComponent = Ember.Component.extend({
    classNames: ['wrapper', 'form'],
    store: injectStore('main'),
    tab(){
        return this.get('store').find('tab', this.get('model.id'));
    },
    actions: {
        saveBase() {
            this.sendAction('saveBase');
        },
        save() {
            let model = this.get('model'); 
            let repository = this.get('repository');
            repository.update(model).then(() => {
                this.attrs.save(this.tab());
            });
        },
        delete() {
            let model = this.get('model');
            let repository = this.get('repository');
            this.attrs.delete(this.tab(), model, repository);
        },
        cancel() {
            this.attrs.cancel(this.tab());
        },
    }
});

export default BaseComponent;

