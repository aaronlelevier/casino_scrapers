import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';

const HOME_URL = '/';
const NAVBAR = '.t-navbar-items';

var application;

module('Acceptance | application layout test', {
    beforeEach() {
        application = startApp();
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('navbar and tray have correct items', function(assert) {
    visit(HOME_URL);
    andThen(() => {
        assert.equal(find('.t-tray-items > li').length, 4);

        assert.equal(find(NAVBAR + ' > li').length, 10);
        assert.equal(find(NAVBAR + ' > li:eq(0)').text(), 'Home');
        assert.equal(find(NAVBAR + ' > li:eq(1)').text(), 'Tickets');
        assert.equal(find(NAVBAR + ' > li:eq(2)').text(), 'Work Orders');
        assert.equal(find(NAVBAR + ' > li:eq(3)').text(), 'Purchase Orders');
        assert.equal(find(NAVBAR + ' > li:eq(4)').text(), 'Tasks');
        assert.equal(find(NAVBAR + ' > li:eq(5)').text(), 'Projects');
        assert.equal(find(NAVBAR + ' > li:eq(6)').text(), 'RFQs');
        assert.equal(find(NAVBAR + ' > li:eq(7)').text(), 'PM');
        assert.equal(find(NAVBAR + ' > li:eq(8)').text(), 'Assets');
        assert.equal(find(NAVBAR + ' > li:eq(9)').text(), 'Invoices');
    });
});
