import Ember from 'ember';
import injectStore from 'bsrs-ember/utilities/store';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var BaseComponent = Ember.Component.extend(ValidationMixin, {
    classNames: ['wrapper', 'form'],
    store: injectStore('main'),
    tab(){
        return this.get('store').find('tab', this.get('model.id'));
    },
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                let model = this.get('model'); 
                let repository = this.get('repository');
                repository.insert(model).then(() => {
                    let tab = this.tab();
                    tab.set('saveModel', true);
                    this.sendAction('save', tab);
                });
            }
        },
        delete() {
            let model = this.get('model');
            let repository = this.get('repository');
            this.sendAction('delete', this.tab(), model, repository);
        },
        cancel() {
            this.sendAction('cancel', this.tab());
        },
    }
});

export default BaseComponent;

