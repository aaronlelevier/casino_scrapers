import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
    repository: inject('filterset'),
    model: function() {
        let repository = this.get('repository');
        return repository.fetch();
    }
});
