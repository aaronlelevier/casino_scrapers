import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var CategorySingleComponent = Ember.Component.extend({
    repository: inject('category'),
    actions: {
        save() {
            var model = this.get('model');
            var repository = this.get('repository');
            repository.update(model).then(() => {
                this.sendAction('save');
            });
        },
        cancel() {
            this.sendAction('cancel');
        },
        delete() {

        }
    } 
});

export default CategorySingleComponent;
