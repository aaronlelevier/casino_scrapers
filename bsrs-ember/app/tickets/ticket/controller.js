import Ember from 'ember';

var TicketController = Ember.Controller.extend({
    queryParams: ['search_cc', 'search_location'],
    search_cc: undefined,
    search_location: undefined,
});
export default TicketController;


