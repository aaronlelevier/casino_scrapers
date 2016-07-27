import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

export default GridViewRoute.extend({
  repository: inject('assignments')
});
