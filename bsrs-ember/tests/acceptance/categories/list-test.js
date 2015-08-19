import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const CATEGORIES_URL = BASEURLS.base_categories_url + '/index';

let application;

module('Acceptance | category-list', {
    beforeEach() {
        application = startApp();
        let endpoint = PREFIX + CATEGORIES_URL + "/";
        xhr(endpoint, "GET", null, {}, 200, CATEGORY_FIXTURES.list());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('visiting /categories/index', (assert) => {
    visit(CATEGORIES_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
        assert.equal(find('h1.t-categories').text(), 'Categories');
        assert.equal(find('tr.t-categories-data').length, 23);
        assert.equal(find('th:eq(1)').text(), 'Name ');
        assert.equal(find('th:eq(2)').text(), 'Description ');
        assert.equal(find('th:eq(3)').text(), 'Label ');
    });
});
