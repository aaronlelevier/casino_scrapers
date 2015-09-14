import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_PEOPLE_LIST_URL = BASEURLS.base_people_url;
const PEOPLE_URL = BASE_PEOPLE_LIST_URL + '/index';

var application;

module('Acceptance | people-list', {
    beforeEach() {
        application = startApp();
        var endpoint = PREFIX + BASE_PEOPLE_LIST_URL + '/';
        xhr(endpoint + '?page=1', 'GET', null, {}, 200, PEOPLE_FIXTURES.list());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('visiting /people', function(assert) {
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        assert.equal(find('h1.t-people').text(), 'People');
        assert.equal(find('tr.t-person-data').length, 10);
    });
});
