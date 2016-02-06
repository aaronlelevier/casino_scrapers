import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';

export default Ember.Route.extend({
    store: injectStore('main'),
    repository: inject('setting'),
    model(params){
        const id = params.id;
        const repository = this.get('repository');
        return repository.findById(id);
    }
});
