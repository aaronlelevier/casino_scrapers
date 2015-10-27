import {test, module} from 'qunit';
import Ticket from 'bsrs-ember/models/ticket';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';

module('unit: ticket attrs test');

test('default state for on ticket model is an empty string', (assert) => {
    var ticket = Ticket.create({id: TICKET_DEFAULTS.idOne, subject: ''});
    ticket.set('subject', 'bill');
    assert.ok(ticket.get('isDirty'));
    ticket.set('subject', '');
    assert.ok(ticket.get('isNotDirty'));
});
