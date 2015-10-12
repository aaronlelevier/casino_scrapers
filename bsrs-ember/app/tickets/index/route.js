import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var TicketsIndexRoute = GridViewRoute.extend({
    repository: inject('ticket')
});

export default TicketsIndexRoute;
