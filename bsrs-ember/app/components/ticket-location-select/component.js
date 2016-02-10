import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import inject from 'bsrs-ember/utilities/inject';

var TicketLocation = Ember.Component.extend({
    repository: inject('location'),
    actions: {
        selected(location) {
            let ticket = this.get('ticket');
            if (location) {
                //TODO: test this
                location.status_fk = location.status;
                delete location.status;
                ticket.change_location(location);
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
                }, config.DEBOUNCE_TIMEOUT_INTERVAL);
            });
        }
    }
});

export default TicketLocation;
