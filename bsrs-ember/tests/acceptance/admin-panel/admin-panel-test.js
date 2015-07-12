import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';

const ADMIN_URL = '/admin';

var application;

module('xx Acceptance | admin layout test', {
    beforeEach: function() {
        application = startApp();
    },
    afterEach: function() {
        Ember.run(application, 'destroy');
    }
});

test('admin panel displays correct headers and section headers', function(assert) {
    visit(ADMIN_URL);
    var $adminPanel = '.t-side-menu';
    andThen(() => { 
        assert.equal(find($adminPanel + ' > section').length, 5);
        assert.equal(find($adminPanel + ' > section:eq(0) h3').text().trim(), "Settings");
        assert.equal(find($adminPanel + ' > section:eq(1) h3').text().trim(), "Users");
        assert.equal(find($adminPanel + ' > section:eq(2) h3').text().trim(), "Locations");
        assert.equal(find($adminPanel + ' > section:eq(3) h3').text().trim(), "Categories");
        assert.equal(find($adminPanel + ' > section:eq(4) h3').text().trim(), "Contractors");
    });
});
