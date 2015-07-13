import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';

const HOME_URL = '/';

var application;

module('Acceptance | application layout test', {
    beforeEach: function() {
        application = startApp();
    },
    afterEach: function() {
        Ember.run(application, 'destroy');
    }
});

test('navbar and tray have correct items', function(assert) {
    visit(HOME_URL);
    var $navbar = '.t-navbar-items';
    var $tray = '.t-tray-items';

    andThen(() => {
        assert.equal(find($tray + ' > li').length, 4);
        
        assert.equal(find($navbar + ' > li').length, 10);
        assert.equal(find($navbar + ' > li:eq(0)').text(), ' Home');
        assert.equal(find($navbar + ' > li:eq(1)').text(), ' Tickets');
        assert.equal(find($navbar + ' > li:eq(2)').text(), ' Work Orders');
        assert.equal(find($navbar + ' > li:eq(3)').text(), ' Purchase Orders');
        assert.equal(find($navbar + ' > li:eq(4)').text(), ' Tasks');
        assert.equal(find($navbar + ' > li:eq(5)').text(), ' Projects');
        assert.equal(find($navbar + ' > li:eq(6)').text(), ' RFQs');
        assert.equal(find($navbar + ' > li:eq(7)').text(), ' PM');
        assert.equal(find($navbar + ' > li:eq(8)').text(), ' Assets');
        assert.equal(find($navbar + ' > li:eq(9)').text(), ' Invoices');
    });
});

