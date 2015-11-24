import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import CF from 'bsrs-ember/vendor/category_fixtures';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/tickets';
import generalPage from 'bsrs-ember/tests/pages/general';
import { ticket_payload_with_attachment } from 'bsrs-ember/tests/helpers/payloads/ticket';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const DETAIL_URL = BASE_URL + '/' + TD.idOne;
const TICKET_URL = BASE_URL + '/index';
const TICKET_PUT_URL = PREFIX + DETAIL_URL + '/';
const PROGRESS_BAR = '.progress-bar';

let application, store, original_uuid;

module('toran Acceptance | ticket file upload test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        let top_level_categories_endpoint = PREFIX + '/admin/categories/?parent__isnull=True';
        xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
        xhr(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
        original_uuid = random.uuid;
        random.uuid = function() { return UUID.value; };
    },
    afterEach() {
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('upload will post form data, show progress and on save append the attachment', (assert) => {
    let model = store.find('ticket', TD.idOne);
    let image = {name: 'foo.png', type: 'image/png', size: 234000};
    ajax(`${PREFIX}${BASE_URL}/${TD.idOne}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(PROGRESS_BAR).length, 0);
        assert.equal(store.find('attachment').get('length'), 0);
    });
    ajax(`${PREFIX}/admin/attachments/`, 'POST', new FormData(), {}, 201, {id: UUID.value});
    uploadFile('attach-file', 'upload', image, model);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(PROGRESS_BAR).length, 1);
        assert.ok(find(PROGRESS_BAR).is(':visible'));
        assert.equal(find(PROGRESS_BAR).attr('style'), 'width: 100%;');
        assert.equal(store.find('attachment').get('length'), 1);
        assert.equal(model.get('attachments').get('length'), 1);
        assert.equal(model.get('isDirty'), false);
        assert.ok(model.get('isDirtyOrRelatedDirty'));
    });
    ajax(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_with_attachment), {}, 200, TF.detail(TD.idOne));
    ajax(`${PREFIX}${BASE_URL}/?page=1`, 'GET', null, {}, 200, TF.list());
    generalPage.save();
    andThen(() => {
        model = store.find('ticket', TD.idOne);
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(store.find('attachment').get('length'), 1);
        assert.equal(model.get('attachments').get('length'), 1);
        assert.equal(model.get('isDirty'), false);
        assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('uploading a file, then rolling back should throw out any previously associated attachments', (assert) => {
    let model = store.find('ticket', TD.idOne);
    let image = {name: 'foo.png', type: 'image/png', size: 234000};
    ajax(`${PREFIX}${BASE_URL}/${TD.idOne}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(PROGRESS_BAR).length, 0);
        assert.equal(store.find('attachment').get('length'), 0);
        assert.equal(find('.dirty').length, 0);
    });
    ajax(`${PREFIX}/admin/attachments/`, 'POST', new FormData(), {}, 201, {id: UUID.value});
    uploadFile('attach-file', 'upload', image, model);
    andThen(() => {
        assert.equal(store.find('attachment').get('length'), 1);
        assert.equal(model.get('attachments').get('length'), 1);
        assert.equal(model.get('isDirty'), false);
        assert.ok(model.get('isDirtyOrRelatedDirty'));
        assert.equal(find('.dirty').length, 1);
    });
    ajax(`${PREFIX}${BASE_URL}/?page=1`, 'GET', null, {}, 200, TF.list());
    visit(TICKET_URL);
    click('.t-tab-close:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        waitFor(() => {
            assert.equal(find('.t-modal-body').length, 1);
        });
    });
    click('.t-modal-rollback-btn');
    andThen(() => {
        assert.equal(model.get('attachments').get('length'), 0);
        assert.equal(model.get('isDirty'), false);
        assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
    });
});

test('previously attached files do not show up after file upload', (assert) => {
    let detail_with_attachment = TF.detail(TD.idOne);
    detail_with_attachment.attachments = [TD.attachmentOneId];
    let model = store.find('ticket', TD.idOne);
    let image = {name: 'foo.png', type: 'image/png', size: 234000};
    ajax(`${PREFIX}${BASE_URL}/${TD.idOne}/`, 'GET', null, {}, 200, detail_with_attachment);
    page.visitDetail();
    andThen(() => {
        model = store.find('ticket', TD.idOne);
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find(PROGRESS_BAR).length, 0);
        assert.equal(store.find('attachment').get('length'), 1);
        assert.equal(model.get('attachments').get('length'), 1);
        assert.equal(model.get('isDirty'), false);
        assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
    });
    ajax(`${PREFIX}/admin/attachments/`, 'POST', new FormData(), {}, 201, {id: UUID.value});
    uploadFile('attach-file', 'upload', image, model);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        model = store.find('ticket', TD.idOne);
        assert.equal(find(PROGRESS_BAR).length, 1);
        assert.ok(find(PROGRESS_BAR).is(':visible'));
        assert.equal(find(PROGRESS_BAR).attr('style'), 'width: 100%;');
        assert.equal(store.find('attachment').get('length'), 2);
        assert.equal(model.get('attachments').get('length'), 2);
        assert.equal(model.get('isDirty'), false);
        assert.ok(model.get('isDirtyOrRelatedDirty'));
    });
});
