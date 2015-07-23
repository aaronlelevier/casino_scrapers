import Ember from 'ember';
import Person from 'bsrs-ember/models/person';

export default Ember.Route.extend({
    model() {
        return Person.create();  
    },
    actions: {
        savePerson() {
            this.transitionTo('admin.people');
        }
    }
});
