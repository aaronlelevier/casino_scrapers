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
            repository.insert(model).then(() => {
                let tab = this.tab();
                tab.set('saveModel', true);
                this.attrs.save(tab);
            });
        },
        cancel() {
            this.attrs.cancel(this.tab());
        },
    }
});

export default BaseComponent;

