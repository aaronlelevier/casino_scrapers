import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var DTDSRoute = GridViewRoute.extend({
    repository: inject('dtd')
});

export default DTDSRoute;
