import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/dtd';
import generalPage from 'bsrs-ember/tests/pages/general';
import { dtd_payload_with_attachment, dtd_payload_with_attachments } from 'bsrs-ember/tests/helpers/payloads/dtd';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_dtd_url;
const DETAIL_URL = `${BASE_URL}/${DTD.idOne}`;
const DETAIL_TWO_URL = `${BASE_URL}/${DTD.idTwo}`;
const DTD_URL = `${BASE_URL}/index`;
const DTD_PUT_URL = `${PREFIX}${DETAIL_URL}/`;
const ATTACHMENT_DELETE_URL = `${PREFIX}/admin/attachments/${UUID.value}/`;
const PROGRESS_BAR = '.progress-bar';

let application, store, original_uuid, detail_xhr, list_xhr, endpoint;

module('scott Acceptance | dtd file upload test', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('store:main');
    endpoint = `${PREFIX}${BASE_URL}/`;
    list_xhr = xhr(`${endpoint}?page=1`, 'GET', null, {}, 200, DTDF.list());
    detail_xhr = xhr(`${endpoint}${DTD.idOne}/`, 'GET', null, {}, 200, DTDF.detail(DTD.idOne));
    original_uuid = random.uuid;
    random.uuid = function() { return UUID.value; };
  },
  afterEach() {
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

/* jshint ignore:start */
test('upload will post form data, show progress bar and on save append the attachment', async assert => {
  const model = store.find('dtd', DTD.idOne);
  const image = {name: 'foo.png', type: 'image/png', size: 234000};
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(find(PROGRESS_BAR).length, 0);
  assert.equal(store.find('attachment').get('length'), 0);
  ajax(`${PREFIX}/admin/attachments/`, 'POST', new FormData(), {}, 201, {});
  await uploadFile('dtds/dtd-single', 'upload', image, model);
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(find(PROGRESS_BAR).length, 1);
  assert.ok(find(PROGRESS_BAR).is(':visible'));
  assert.equal(find(PROGRESS_BAR).attr('style'), 'width: 100%;');
  assert.equal(store.find('attachment').get('length'), 1);
  assert.equal(model.get('attachments').get('length'), 1);
  assert.equal(model.get('isDirty'), false);
  assert.ok(model.get('isDirtyOrRelatedDirty'));
  ajax(DTD_PUT_URL, 'PUT', JSON.stringify(dtd_payload_with_attachment), {}, 200, DTDF.detail(DTD.idOne));
  await generalPage.save();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(store.find('attachment').get('length'), 1);
  assert.equal(model.get('attachments').get('length'), 1);
  assert.equal(model.get('isDirty'), false);
  assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
});
/* jshint ignore:end */