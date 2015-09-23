import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var LocationIndexRoute = GridViewRoute.extend({
    repository: inject('location')
});

export default LocationIndexRoute;
