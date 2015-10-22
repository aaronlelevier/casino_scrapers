import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import THIRD_PARTY_FIXTURES from 'bsrs-ember/vendor/third_party_fixtures';
import THIRD_PARTY_DEFAULTS from 'bsrs-ember/vendor/defaults/third-party';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_third_parties_url;
const THIRD_PARTY_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + THIRD_PARTY_DEFAULTS.idOne;

let application, store, endpoint, endpoint_detail, list_xhr, detail_xhr;

module('aaron Acceptance | detail-test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        let location_list_data = THIRD_PARTY_FIXTURES.list();
        let location_detail_data = THIRD_PARTY_FIXTURES.detail();
        endpoint = PREFIX + BASE_URL + '/';
        endpoint_detail = PREFIX + DETAIL_URL + '/';
        list_xhr = xhr(endpoint, 'GET', null, {}, 200, location_list_data);
        detail_xhr = xhr(endpoint_detail, 'GET', null, {}, 200, location_detail_data);
    },
    afterEach() {
       Ember.run(application, 'destroy');
       detail_xhr = null;
       list_xhr = null;
    }
});

test('clicking on a third party name will redirect them to the detail view', (assert) => {
    visit(THIRD_PARTY_URL);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_URL);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
});
