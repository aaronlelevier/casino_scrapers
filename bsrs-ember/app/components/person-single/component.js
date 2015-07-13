import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend({
    repository: inject('person'),
    classNames: ['wrapper', 'form'],
    actions: {
        savePerson: function() {
            var model = this.get('model');
            var repository = this.get('repository');
            repository.save(model).then(() => {
                this.sendAction('savePerson');
            });
        },
        cancelPerson: function() {
            this.sendAction('cancelPerson');
        }
    }
});
