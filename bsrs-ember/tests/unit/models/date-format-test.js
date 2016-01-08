import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/i18n/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import timemachine from 'vendor/timemachine';
import moment from 'moment';

var store, ticket, time;

module('unit: date format test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'service:i18n']);
        timemachine.config({
            dateString: 'December 25, 2014 13:12:59'
        });
    },
    afterEach() {
        timemachine.reset();
    }
});

// test('ticket formatted date returns correct value today', (assert) => {
//     ticket = store.push('ticket', {id: 1, created: TD.createdISOToday});
//     const expected = 'December 25th 2014, 1:12:59 pm';
//     assert.equal(ticket.get('created'), TD.createdISOToday);
//     assert.equal(moment(new Date()).format('MMMM Do YYYY, h:mm:ss a'), expected);
//     time = moment(TD.createdISOToday).format('h:mm a');
//     assert.equal(ticket.get('formatted_date'), `${TD.createdFormattedToday} ${time}`);
// });

// test('ticket formatted date returns correct value yesterday', (assert) => {
//     ticket = store.push('ticket', {id: 1, created: TD.createdISOYesterday});
//     assert.equal(ticket.get('created'), TD.createdISOYesterday);
//     time = moment(TD.createdISOYesterday).format('h:mm a');
//     assert.equal(ticket.get('formatted_date'), `${TD.createdFormattedYesterday} ${time}`);
// });

// test('ticket formatted date returns correct value < 7 days ago', (assert) => {
//     ticket = store.push('ticket', {id: 1, created: TD.createdISOTwoDaysAgo});
//     assert.equal(ticket.get('created'), TD.createdISOTwoDaysAgo);
//     time = moment(TD.createdISOTwoDaysAgo).format('h:mm a');
//     assert.equal(ticket.get('formatted_date'), `${TD.createdFormattedTwoDaysAgo} ${time}`);
// });

// test('ticket formatted date returns correct value > 7 days ago', (assert) => {
//     ticket = store.push('ticket', {id: 1, created: TD.createdISOTwoWeeksAgo});
//     assert.equal(ticket.get('created'), TD.createdISOTwoWeeksAgo);
//     time = moment(TD.createdISOTwoWeeksAgo).format('h:mm a');
//     assert.equal(ticket.get('formatted_date'), `${TD.createdFormattedTwoWeeksAgo} ${time}`);
// });

test('ticket with undefined date returns undefined', (assert) => {
    ticket = store.push('ticket', {id: 1, created: undefined});
    assert.equal(ticket.get('created'), undefined);
    assert.equal(ticket.get('formatted_date'), undefined);
});
