import Ember from 'ember';
import injectUUID from 'bsrs-ember/utilities/uuid';
import NewRollbackModalMixin from 'bsrs-ember/mixins/route/rollback/new';

var CategoryNewRoute = Ember.Route.extend(NewRollbackModalMixin, {
    uuid: injectUUID('uuid'),
    model() {
        let pk = this.get('uuid').v4();
        return this.get('store').push('category', {id: pk, new: true});
    },
    actions: {
        redirectUser() {
           this.transitionTo('admin.categories');
        }
    }
});

export default CategoryNewRoute;
