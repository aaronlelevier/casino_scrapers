import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import CF from 'bsrs-ember/vendor/category_fixtures';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/tickets';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + TD.idOne;
const TICKET_PUT_URL = PREFIX + DETAIL_URL + '/';

let application, store, original_uuid;

module('Acceptance | ticket file upload test', {
    beforeEach() {
        application = startApp();
        // store = application.__container__.lookup('store:main');
        // let top_level_categories_endpoint = PREFIX + '/admin/categories/?parent__isnull=True';
        // xhr(`${PREFIX}${BASE_URL}/${TD.idOne}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
        // xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
        // xhr(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
        original_uuid = random.uuid;
        random.uuid = function() { return UUID.value; };
    },
    afterEach() {
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('finish this up ember side', (assert) => {
    assert.equal(1, 1);
});

//finish: requires fauxjax and/or ember-cli-test-helpers pull-request (FormData support)
//test('clicking a tickets will redirect to the given detail view and can save to ensure validation mixins are working', (assert) => {
//    let model = store.find('ticket', TD.idOne);
//    let file = {name: 'toranb.png', type: 'image/png', size: 234000};
//    page.visitDetail();
//    andThen(() => {
//        assert.equal(currentURL(), DETAIL_URL);
//    });
//    xhr(`${PREFIX}/admin/attachments/`, 'POST', new FormData(), {}, 201, {id: UUID.value});
//    uploadFile('tickets/ticket-single', 'upload', file, model);
//    andThen(() => {
//        //assert models are added to the store but not persisted...
//        assert.equal(currentURL(), DETAIL_URL);
//    });
//});
