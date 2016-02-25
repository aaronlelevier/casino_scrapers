import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_dtd_url;
const DT_URL = `${BASE_URL}/index`;

let application;

module('Acceptance | dtd list test', {
    beforeEach() {
        application = startApp();
        let endpoint = `${PREFIX}${BASE_URL}/`;
        xhr(`${endpoint}?page=1`,'GET', null, {}, 200, DTDF.list());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('visiting /dtds', (assert) => {
    visit(DT_URL);
    andThen(() => {
        assert.equal(currentURL(), DT_URL);
    });
});

