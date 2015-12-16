import {test, module} from 'bsrs-ember/tests/helpers/i18n/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import timemachine from 'vendor/timemachine';
import moment from 'moment';

var store;

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

test('ticket formatted date returns correct value today', (assert) => {
    let ticket = store.push('ticket', {id: 1, created: TD.createdISOToday});
    const expected = 'December 25th 2014, 1:12:59 pm';
    assert.equal(ticket.get('created'), TD.createdISOToday);
    assert.equal(moment(new Date()).format('MMMM Do YYYY, h:mm:ss a'), expected);
    assert.equal(ticket.get('formatted_date'), TD.createdFormattedToday);
});

test('ticket formatted date returns correct value yesterday', (assert) => {
    let ticket = store.push('ticket', {id: 1, created: TD.createdISOYesterday});
    assert.equal(ticket.get('created'), TD.createdISOYesterday);
    assert.equal(ticket.get('formatted_date'), TD.createdFormattedYesterday);
});

test('ticket formatted date returns correct value < 7 days ago', (assert) => {
    let ticket = store.push('ticket', {id: 1, created: TD.createdISOTwoDaysAgo});
    assert.equal(ticket.get('created'), TD.createdISOTwoDaysAgo);
    assert.equal(ticket.get('formatted_date'), TD.createdFormattedTwoDaysAgo);
});

test('ticket formatted date returns correct value > 7 days ago', (assert) => {
    let ticket = store.push('ticket', {id: 1, created: TD.createdISOTwoWeeksAgo});
    assert.equal(ticket.get('created'), TD.createdISOTwoWeeksAgo);
    assert.equal(ticket.get('formatted_date'), TD.createdFormattedTwoWeeksAgo);
});

test('ticket with undefined date returns undefined', (assert) => {
    let ticket = store.push('ticket', {id: 1, created: undefined});
    assert.equal(ticket.get('created'), undefined);
    assert.equal(ticket.get('formatted_date'), undefined);
});

