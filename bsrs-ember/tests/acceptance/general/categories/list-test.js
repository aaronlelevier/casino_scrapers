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
const BASE_URL = BASEURLS.base_categories_url;
const CATEGORIES_URL = BASE_URL + '/index';

let application;

module('Acceptance | category-list', {
    beforeEach() {
        application = startApp();
        let endpoint = PREFIX + BASE_URL + '/';
        xhr(endpoint + '?page=1', "GET", null, {}, 200, CATEGORY_FIXTURES.list());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('visiting /categories/index', (assert) => {
    visit(CATEGORIES_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});
