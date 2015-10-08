import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var LocationLevelIndexRoute = GridViewRoute.extend({
    repository: inject('location-level')
});

export default LocationLevelIndexRoute;
