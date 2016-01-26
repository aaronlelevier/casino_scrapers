import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import inject from 'bsrs-ember/utilities/inject';

var TicketAssignee = Ember.Component.extend({
    repository: inject('person'),
    actions: {
        selected(person) {
            let ticket = this.get('ticket');
            if (person) {
                ticket.change_assignee(person.get('id'));
            } else {
                ticket.remove_assignee();
            }
        },
        update_filter(search) {
            const repo = this.get('repository');
            return new Ember.RSVP.Promise((resolve, reject) => {
                Ember.run.later(() => {
                    if (Ember.isBlank(search)) { return resolve([]); }
                    resolve(repo.findTicketAssignee(search));
                }, config.DEBOUNCE_TIMEOUT_INTERVAL);
            });
        }
    }
});

export default TicketAssignee;
