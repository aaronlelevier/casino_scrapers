import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var TicketLocation = Ember.Component.extend({
    repository: inject('location'),
    actions: {
        selected(location) {
            let ticket = this.get('ticket');
            if (location) {
                ticket.change_location(location.get('id'));
            }else{
                ticket.remove_location();
            }
        },
        update_filter(search) {
            const repo = this.get('repository');
            return new Ember.RSVP.Promise((resolve, reject) => {
                Ember.run.later(() => {
                    if (Ember.isBlank(search)) { return resolve([]); }
                    resolve(repo.findTicket(search));
                }, 300);
            });
        }
    }
});

export default TicketLocation;
