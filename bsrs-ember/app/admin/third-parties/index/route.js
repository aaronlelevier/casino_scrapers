import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var ThirdPartyRoute = Ember.Route.extend({
    repository: inject('third-party'),
    model() {
        return this.get('repository').find();
    }
});

export default ThirdPartyRoute;
