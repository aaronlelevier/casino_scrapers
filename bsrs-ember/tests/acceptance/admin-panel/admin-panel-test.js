import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';

const ADMIN_URL = '/admin';

var application;
const ADMINPANEL = '.t-side-menu';

module('Acceptance | admin layout test', {
    beforeEach() {
        application = startApp();
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('admin panel displays correct headers and section headers', function(assert) {
    visit(ADMIN_URL);
    andThen(() => {
        assert.equal(find(ADMINPANEL + ' > section').length, 5);
        assert.equal(find(ADMINPANEL + ' > section:eq(0) h3').text().trim(), "Settings");
        assert.equal(find(ADMINPANEL + ' > section:eq(1) h3').text().trim(), "People");
        assert.equal(find(ADMINPANEL + ' > section:eq(2) h3').text().trim(), "Locations");
        assert.equal(find(ADMINPANEL + ' > section:eq(3) h3').text().trim(), "Categories");
        assert.equal(find(ADMINPANEL + ' > section:eq(4) h3').text().trim(), "Contractors");
    });
});

// test('admin panel shows bootstrapped filter set as links into the application for a given section', function(assert) {
//     visit(ADMIN_URL);
//     andThen(() => {
//         let people_section = find(ADMINPANEL + ' > section:eq(1)');
//         assert.equal(people_section.find('.t-admin-people-index-navigation li').length, 2);
//         assert.equal(people_section.find('.t-admin-people-index-navigation li:eq(0) a').prop('href').slice(21), '/admin/people/index?sort=title');
//         assert.equal(people_section.find('.t-admin-people-index-navigation li:eq(1) a').prop('href').slice(21), '/admin/people/index?find=username%3Awa');
//         assert.equal(people_section.find('.t-admin-roles-index-navigation li').length, 1);
//         assert.equal(people_section.find('.t-admin-roles-index-navigation li:eq(0) a').prop('href').slice(21), '/admin/roles/index?page_size=25');
//     });
// });
