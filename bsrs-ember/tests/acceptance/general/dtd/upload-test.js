import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/dtd';
import generalPage from 'bsrs-ember/tests/pages/general';
import TAD from 'bsrs-ember/vendor/defaults/ticket_activity';
import { dtd_payload_with_attachment, dtd_payload_with_attachments } from 'bsrs-ember/tests/helpers/payloads/dtd';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_dtd_url;
const DETAIL_URL = `${BASE_URL}/${DTD.idOne}`;
const DETAIL_TWO_URL = `${BASE_URL}/${DTD.idTwo}`;
const DTD_URL = `${BASE_URL}/index`;
const DTD_PUT_URL = `${PREFIX}${DETAIL_URL}/`;
const ATTACHMENT_DELETE_URL = `${PREFIX}/admin/attachments/${UUID.value}/`;
const ADMIN_URL = BASEURLS.base_admin_url;
const PROGRESS_BAR = '.progress-bar';

let application, store, original_uuid, detail_xhr, list_xhr, endpoint;

module('Acceptance | dtd file upload test', {
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
test('scott upload will post form data, show progress bar and on save append the attachment to detail and preview', async assert => {
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
  const detail_with_attachment = DTDF.detail(DTD.idOne);
  detail_with_attachment.attachments = [{id: UUID.value, filename: 'wat.jpg', file: 'attachments/images/full/wat.jpg', image_full: 'attachments/images/full/wat.jpg', image_thumbnail: 'attachments/images/thumbnail/wat.jpg', 
    image_medium: 'attachments/images/medium/wat.jpg'}];
  ajax(DTD_PUT_URL, 'PUT', JSON.stringify(dtd_payload_with_attachment), {}, 200, detail_with_attachment);
  clearxhr(detail_xhr);
  await generalPage.save();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(store.find('attachment').get('length'), 1);
  assert.equal(model.get('attachments').get('length'), 1);
  assert.equal(model.get('isDirty'), false);
  assert.ok(model.get('attachmentsIsNotDirty'));
  assert.equal(find('.t-ticket-attachment-add-remove:eq(0)').attr('href'), `/media/attachments/images/full/wat.jpg`);
  assert.equal(find('.t-ticket-attachment-add-remove:eq(0) .t-ext-jpg').length, 1);
  assert.ok(find('.t-ticket-attachment-add-remove:eq(0) .t-ext-jpg > img').attr('src'));
  assert.equal(find('.t-ticket-attachment-add-remove:eq(0)').text().trim(), 'wat.jpg');
  assert.equal(find('.t-attachment-add-remove:eq(0)').text().trim(), 'wat.jpg');
  assert.equal(find('.t-dtd-preview-attachment > a').text().trim(), 'wat.jpg');
  assert.equal(find('.t-dtd-preview-attachment > a').attr('href'), `/media/attachments/images/full/wat.jpg`);
  assert.equal(find('.t-dtd-preview-attachment .t-ext-jpg').length, 1);
  assert.equal(find('.t-dtd-preview-attachment > a').text().trim(), 'wat.jpg');
});

test('uploading a file, then rolling back should throw out previously associated attachments', async assert => {
  const model = store.find('dtd', DTD.idOne);
  const image = {name: 'foo.png', type: 'image/png', size: 234000};
  await page.visitDetail();
  ajax(`${PREFIX}/admin/attachments/`, 'POST', new FormData(), {}, 201, {});
  await uploadFile('dtds/dtd-single', 'upload', image, model);
  await generalPage.cancel();
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
      assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
    });
  });
  ajax(`${PREFIX}/admin/attachments/batch-delete/`, 'DELETE', {ids: [UUID.value]}, {}, 204, {});
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsHidden);
      assert.equal(model.get('attachments').get('length'), 0);
      assert.equal(store.find('attachment').get('length'), 0);
      assert.equal(model.get('isDirty'), false);
      assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
    });
  });
});

test('previously attached files do not show up after file upload', async assert => {
  clearxhr(detail_xhr);
  const detail_with_attachment = DTDF.detail(DTD.idOne);
  detail_with_attachment.attachments = [{id: DTD.attachmentOneId}];
  const model = store.find('dtd', DTD.idOne);
  const image = {name: 'foo.png', type: 'image/png', size: 234000};
  ajax(`${PREFIX}${BASE_URL}/${DTD.idOne}/`, 'GET', null, {}, 200, detail_with_attachment);
  await page.visitDetail();
  assert.equal(find(PROGRESS_BAR).length, 0);
  assert.equal(store.find('attachment').get('length'), 1);
  assert.equal(model.get('attachments').get('length'), 1);
  ajax(`${PREFIX}/admin/attachments/`, 'POST', new FormData(), {}, 201, {});
  await uploadFile('dtds/dtd-single', 'upload', image, model);
  assert.equal(find(PROGRESS_BAR).length, 1);
  assert.ok(find(PROGRESS_BAR).is(':visible'));
  assert.equal(find(PROGRESS_BAR).attr('style'), 'width: 100%;');
  assert.equal(store.find('attachment').get('length'), 2);
  assert.equal(model.get('attachments').get('length'), 2);
  assert.equal(model.get('isDirty'), false);
  assert.ok(model.get('isDirtyOrRelatedDirty'));
});

test('delete attachment is successful when the user confirms yes (before the file is associated with a dtd)', (assert) => {
  let model = store.find('dtd', DTD.idOne);
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(PROGRESS_BAR).length, 0);
    assert.equal(store.find('attachment').get('length'), 0);
  });
  ajax(`${PREFIX}/admin/attachments/`, 'POST', new FormData(), {}, 201, {});
  uploadFile('dtds/dtd-single', 'upload', image, model);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    model = store.find('dtd', DTD.idOne);
    assert.equal(find(PROGRESS_BAR).length, 1);
    assert.equal(store.find('attachment').get('length'), 1);
    assert.equal(model.get('attachments').get('length'), 1);
  });
  ajax(ATTACHMENT_DELETE_URL, 'DELETE', null, {}, 204, {});
  click('.t-remove-attachment');
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.deleteModalIsVisible);
      assert.equal(find('.t-modal-delete-body').text().trim(), t('crud.delete.confirm'));
    });
  });
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.deleteModalIsHidden);
      model = store.find('dtd', DTD.idOne);
      assert.equal(find(PROGRESS_BAR).length, 0);
      assert.equal(store.find('attachment').get('length'), 0);
      assert.equal(model.get('attachments').get('length'), 0);
    });
  });
});

test('user cannot see progress bar for uploaded attachment that is associated with a dtd (after save)', async assert => {
  let model = store.find('dtd', DTD.idOne);
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  await page.visitDetail();
  ajax(`${PREFIX}/admin/attachments/`, 'POST', new FormData(), {}, 201, {});
  await uploadFile('dtds/dtd-single', 'upload', image, model);
  assert.equal(find(PROGRESS_BAR).length, 1);
  assert.equal(store.find('attachment').get('length'), 1);
  assert.equal(model.get('attachments').get('length'), 1);
  assert.equal(find('.t-remove-attachment').length, 1);
  ajax(DTD_PUT_URL, 'PUT', JSON.stringify(dtd_payload_with_attachment), {}, 200, DTDF.detail(DTD.idOne));
  await generalPage.save();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(find(PROGRESS_BAR).length, 0);
});

test('file upload supports multiple attachments', async assert => {
  let model = store.find('dtd', DTD.idOne);
  let one = {name: 'one.png', type: 'image/png', size: 234000};
  let two = {name: 'two.png', type: 'image/png', size: 124000};
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(find(PROGRESS_BAR).length, 0);
  assert.equal(store.find('attachment').get('length'), 0);
  patchRandomAsync(0);
  ajax(`${PREFIX}/admin/attachments/`, 'POST', new FormData(), {}, 201, {});
  await uploadFile('dtds/dtd-single', 'upload', [one, two], model);
  assert.equal(find(PROGRESS_BAR).length, 2);
  assert.ok(find(PROGRESS_BAR).is(':visible'));
  assert.equal(find(PROGRESS_BAR).attr('style'), 'width: 100%;');
  assert.equal(store.find('attachment').get('length'), 2);
  assert.equal(model.get('attachments').get('length'), 2);
  assert.equal(model.get('isDirty'), false);
  assert.ok(model.get('isDirtyOrRelatedDirty'));
  ajax(DTD_PUT_URL, 'PUT', JSON.stringify(dtd_payload_with_attachments), {}, 200, DTDF.detail(DTD.idOne));
  await generalPage.save();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(store.find('attachment').get('length'), 2);//need faked out xhr to get 2 attachments in there 
  assert.equal(model.get('isDirty'), false);
  assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
});

test('rolling back should only remove files not yet associated with a given dtd', async assert => {
  clearxhr(detail_xhr);
  let detail_with_attachment = DTDF.detail(DTD.idOne);
  detail_with_attachment.attachments = [{id: DTD.attachmentOneId}];
  let model = store.find('dtd', DTD.idOne);
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  ajax(`${PREFIX}${BASE_URL}/${DTD.idOne}/`, 'GET', null, {}, 200, detail_with_attachment);
  await page.visitDetail();
  assert.equal(find(PROGRESS_BAR).length, 0);
  assert.equal(store.find('attachment').get('length'), 1);
  assert.equal(model.get('attachments').get('length'), 1);
  assert.equal(model.get('isDirty'), false);
  assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
  ajax(`${PREFIX}/admin/attachments/`, 'POST', new FormData(), {}, 201, {});
  await uploadFile('dtds/dtd-single', 'upload', image, model);
  model = store.find('dtd', DTD.idOne);
  assert.equal(find(PROGRESS_BAR).length, 1);
  assert.ok(find(PROGRESS_BAR).is(':visible'));
  assert.equal(find(PROGRESS_BAR).attr('style'), 'width: 100%;');
  assert.equal(store.find('attachment').get('length'), 2);
  assert.equal(model.get('attachments').get('length'), 2);
  assert.equal(model.get('isDirty'), false);
  assert.ok(model.get('isDirtyOrRelatedDirty'));
  await click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    waitFor(() => {
      assert.equal(find('.t-modal-body').length, 1);
    });
  });
  ajax(`${PREFIX}/admin/attachments/batch-delete/`, 'DELETE', {ids: [UUID.value]}, {}, 204, {});
  await generalPage.clickModalRollback();
  assert.equal(currentURL(), ADMIN_URL);
  assert.equal(model.get('attachments').get('length'), 1);
  assert.equal(store.find('attachment').get('length'), 1);
  assert.equal(model.get('isDirty'), false);
  assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
});

// test('uploading 400 shows error message', async assert => {
//   await page.visitDetail();
//   assert.equal(find(PROGRESS_BAR).length, 0);
//   assert.equal(store.find('attachment').get('length'), 1);
//   assert.equal(model.get('attachments').get('length'), 1);
//   assert.equal(model.get('isDirty'), false);
//   assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
//   ajax(`${PREFIX}/admin/attachments/`, 'POST', new FormData(), {}, 404, {'detail': exception});
//   await uploadFile('dtds/dtd-single', 'upload', image, model);
// });
/* jshint ignore:end */
