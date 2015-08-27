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
        assert.equal(find(NAVBAR + ' > li:eq(0)').text(), t('menu.home'));
        assert.equal(find(NAVBAR + ' > li:eq(1)').text(), t('modules.tickets.titleShort'));
        assert.equal(find(NAVBAR + ' > li:eq(2)').text(), t('modules.workOrders.titleShort'));
        assert.equal(find(NAVBAR + ' > li:eq(3)').text(), t('modules.purchaseOrders.titleShort'));
        assert.equal(find(NAVBAR + ' > li:eq(4)').text(), t('modules.tasks.titleShort'));
        assert.equal(find(NAVBAR + ' > li:eq(5)').text(), t('modules.projects.titleShort'));
        assert.equal(find(NAVBAR + ' > li:eq(6)').text(), t('modules.rfqs.titleShort'));
        assert.equal(find(NAVBAR + ' > li:eq(7)').text(), t('modules.pms.titleShort'));
        assert.equal(find(NAVBAR + ' > li:eq(8)').text(), t('modules.assets.titleShort'));
        assert.equal(find(NAVBAR + ' > li:eq(9)').text(), t('modules.invoices.titleShort'));
    });
});
test('current user is set from bootstrap data', function(assert) {
    visit(HOME_URL);
    andThen(() => {
        assert.equal(find('.t-current-user-fullname').text(), 'Donald Trump');
    });
});
