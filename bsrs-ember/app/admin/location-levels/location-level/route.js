import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import RollbackModalMixin from 'bsrs-ember/mixins/route/rollback/existing';

var LocationLevelSingle =  Ember.Route.extend(RollbackModalMixin, {
    repository: inject('location-level'),
    model(params) {
        var location_level_pk = params.location_level_id;
        var repository = this.get('repository');
        return repository.findById(location_level_pk);
    },
    actions: {
        redirectUser() {
            this.transitionTo('admin.location-levels');
        }
    }
});

export default LocationLevelSingle;

