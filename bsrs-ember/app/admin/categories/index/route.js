import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var CategoryIndexRoute = GridViewRoute.extend({
    repository: inject('category')
});

export default CategoryIndexRoute;
