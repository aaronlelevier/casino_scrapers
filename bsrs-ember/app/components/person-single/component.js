import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend({
    repository: inject('person'),
    classNames: ['wrapper', 'form'],
    attemptedTransition: '',
    actions: {
        savePerson() {
            var model = this.get('model');
            var repository = this.get('repository');
            repository.save(model).then(() => {
                model.save();
                this.sendAction('savePerson');
            });
        },
        cancelPerson() {
            var model = this.get('model');
            this.sendAction('cancelPerson', model);
        }
    }
});
