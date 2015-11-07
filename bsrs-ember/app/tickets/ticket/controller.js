import Ember from 'ember';
import TabActionMixin from 'bsrs-ember/mixins/controller/tab-actions';

var TicketController = Ember.Controller.extend(TabActionMixin, {
    queryParams: ['search_cc', 'search_location', 'search_assignee'],
    search_cc: undefined,
    search_location: undefined,
    search_assignee: undefined,
});
export default TicketController;


