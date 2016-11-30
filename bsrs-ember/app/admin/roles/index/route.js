import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var RolesIndexRoute = GridViewRoute.extend({
  repository: inject('role')
});

export default RolesIndexRoute;
