import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var TicketIndexRoute = GridViewRoute.extend({
    repository: inject('ticket')
});

export default TicketIndexRoute;

