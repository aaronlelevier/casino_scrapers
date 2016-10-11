import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var PersonIndexRoute = GridViewRoute.extend({
  repository: inject('person')
});

export default PersonIndexRoute;
