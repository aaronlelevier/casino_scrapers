import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend({
    repository: inject('person'),
    classNames: ['wrapper', 'form'],
    attemptedTransition: '',
    actions: {
        savePerson() {
            var store = this.get('store'); //TODO: move to repository ...soon
            var model = this.get('model');
            var repository = this.get('repository');
            repository.save(model).then(() => {
                model.save(); //TODO: move to repository soon

                var phone_numbers = store.find('phonenumber', {person_id: model.get('id')});
                phone_numbers.forEach((num) => {
                    num.save();
                });

                this.sendAction('savePerson');
            });
        },
        cancelPerson() {
            var model = this.get('model');
            this.sendAction('cancelPerson', model);
        },
        deletePerson() {            
            //TODO: Add Delete Person here... FYI - delete will not actually delete.
            var model = this.get('model');
            this.sendAction('cancelPerson', model);
        }
    }
});
