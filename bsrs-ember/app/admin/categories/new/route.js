import Ember from 'ember';
import injectUUID from 'bsrs-ember/utilities/uuid';

var CategoryNewRoute = Ember.Route.extend({
    uuid: injectUUID('uuid'),
    model() {
        let pk = this.get('uuid').v4();
        return this.get('store').push('category', {id: pk});
    },
    actions: {
        redirectUser() {
           this.transitionTo('admin.categories.index'); 
        }
    }
});

export default CategoryNewRoute;
