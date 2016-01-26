import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import inject from 'bsrs-ember/utilities/inject';

var TicketPeopleMulti = Ember.Component.extend({
    repository: inject('person'),
    actions: {
        change_cc(new_cc_selection) {
            const ticket = this.get('ticket');
            const old_cc_selection = ticket.get('cc');
            const old_cc_ids = ticket.get('cc_ids');
            const new_cc_ids = new_cc_selection.mapBy('id');
            new_cc_selection.forEach((cc) => {
                if (Ember.$.inArray(cc.id, old_cc_ids) < 0) {
                    ticket.add_person(cc);
                }
            });
            old_cc_selection.forEach((old_cc) => {
                if (Ember.$.inArray(old_cc.get('id'), new_cc_ids) < 0) {
                    ticket.remove_person(old_cc.get('id'));
                }
            }); 
        },
        update_filter(search) {
            const repo = this.get('repository');
            return new Ember.RSVP.Promise((resolve, reject) => {
                Ember.run.later(() => {
                    if (Ember.isBlank(search)) { return resolve([]); }
                    resolve(repo.findTicketPeople(search));
                }, config.DEBOUNCE_TIMEOUT_INTERVAL);
            });
        }
    }
});

export default TicketPeopleMulti;
