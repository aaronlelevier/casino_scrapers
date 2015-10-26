import Ember from 'ember';
import TabActionMixin from 'bsrs-ember/mixins/controller/tab-actions';

var TicketController = Ember.Controller.extend(TabActionMixin, {
    queryParams: ['search', 'search_location', 'search_assignee'],
    search: undefined,
    search_location: undefined,
    search_assignee: undefined,
});
export default TicketController;






