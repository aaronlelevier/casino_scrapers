import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LOCATION_FIXTURES from 'bsrs-ember/vendor/location_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const LOCATION_URL = BASEURLS.base_locations_url + '/index';
const DJANGO_LOCATION_URL = '/admin/locations/';

let application;

module('Acceptance | location-list', {
    beforeEach() {
        application = startApp();
        let endpoint = PREFIX + DJANGO_LOCATION_URL;
        xhr(endpoint + '?page=1','GET', null, {}, 200, LOCATION_FIXTURES.list() );
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('visiting /locations', (assert) => {
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
});
