import Ember from 'ember';

var TicketController = Ember.Controller.extend({
    queryParams: ['search_cc', 'search_location', 'search_assignee'],
    search_cc: undefined,
    search_location: undefined,
    search_assignee: undefined,
});
export default TicketController;


