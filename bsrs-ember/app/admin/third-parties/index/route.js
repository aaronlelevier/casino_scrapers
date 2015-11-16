import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var ThirdPartyIndexRoute = GridViewRoute.extend({
    repository: inject('third-party')
});

export default ThirdPartyIndexRoute;
