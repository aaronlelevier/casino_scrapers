import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import THIRD_PARTY_FIXTURES from 'bsrs-ember/vendor/third_party_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_third_parties_url;
const THIRD_PARTY_URL = BASE_URL + '/index';

let application;

module('Acceptance | third-party-list', {
    beforeEach() {
        application = startApp();
        let endpoint = PREFIX + BASE_URL + '/';
        xhr(endpoint + '?page=1', 'GET', null, {}, 200, THIRD_PARTY_FIXTURES.list() );
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('visiting /third-parties', (assert) => {
    visit(THIRD_PARTY_URL);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_URL);
    });
});


