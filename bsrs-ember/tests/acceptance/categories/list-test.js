import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const CATEGORIES_URL = BASEURLS.base_categories_url + '/index';

var application;

module('sco Acceptance | category-list', {
    beforeEach() {
        application = startApp();
        var endpoint = PREFIX + CATEGORIES_URL + "/";
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
        assert.equal(find('tr.t-categories-data').length, 5);
    });
});
