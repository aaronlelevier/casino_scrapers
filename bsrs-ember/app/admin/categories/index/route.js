import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var CategroyIndexRoute = GridViewRoute.extend({
    repository: inject('category')
});

export default CategroyIndexRoute;
