import Ember from 'ember';
const { run } = Ember;
import { test, skip } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/tickets';
import generalPage from 'bsrs-ember/tests/pages/general';
import { ticket_payload_with_attachment, ticket_payload_with_attachments } from 'bsrs-ember/tests/helpers/payloads/ticket';
import BASEURLS, { TICKETS_URL, ATTACHMENTS_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const DETAIL_URL = BASE_URL + '/' + TD.idOne;
const DETAIL_TWO_URL = BASE_URL + '/' + TD.idTwo;
const TICKET_URL = BASE_URL + '/index';
const TICKET_PUT_URL = PREFIX + DETAIL_URL + '/';
const ATTACHMENT_DELETE_URL = ATTACHMENTS_URL + UUID.value + '/';
const PROGRESS_BAR = '.progress-bar';

let store;

moduleForAcceptance('Acceptance | general ticket file upload test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    xhr(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
    random.uuid = function() { return UUID.value; };
  },
});

test('upload will post form data, show progress and on save append the attachment', (assert) => {
  let model = store.find('ticket', TD.idOne);
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  ajax(`${TICKETS_URL}${TD.idOne}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(PROGRESS_BAR).length, 0);
  });
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 201, {});
  uploadFile('tickets/ticket-comments-and-file-upload', 'upload', image, model);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(PROGRESS_BAR).length, 1);
    assert.ok(find(PROGRESS_BAR).is(':visible'));
    assert.equal(find(PROGRESS_BAR).attr('style'), 'width: 100%;');
    assert.equal(model.get('attachments').get('length'), 1);
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isDirtyOrRelatedDirty'));
  });
  ajax(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_with_attachment), {}, 200, TF.detail(TD.idOne));
  ajax(`${TICKETS_URL}?page=1`, 'GET', null, {}, 200, TF.list());
  generalPage.save();
  andThen(() => {
    model = store.find('ticket', TD.idOne);
    assert.ok(urlContains(currentURL(), TICKET_URL));
    assert.equal(model.get('attachments').get('length'), 1);
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
  });
});

test('uploading a file, then rolling back should throw out any previously associated attachments', (assert) => {
  let model = store.find('ticket', TD.idOne);
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  ajax(`${TICKETS_URL}${TD.idOne}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(PROGRESS_BAR).length, 0);
    assert.equal(find('.dirty').length, 0);
  });
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 201, {});
  uploadFile('tickets/ticket-comments-and-file-upload', 'upload', image, model);
  andThen(() => {
    assert.equal(model.get('attachments').get('length'), 1);
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isDirtyOrRelatedDirty'));
    assert.equal(find('.dirty').length, 1);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    waitFor(assert, () => {
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.close_tab'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  ajax(`${ATTACHMENTS_URL}batch-delete/`, 'DELETE', {ids: [UUID.value]}, {}, 204, {});
  ajax(`${TICKETS_URL}?page=1`, 'GET', null, {}, 200, TF.list());
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
  ajax(`${TICKETS_URL}${TD.idOne}/`, 'GET', null, {}, 200, detail_with_attachment);
  page.visitDetail();
  andThen(() => {
    model = store.find('ticket', TD.idOne);
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(PROGRESS_BAR).length, 0);
    assert.equal(model.get('attachments').get('length'), 1);
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
  });
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 201, {});
  uploadFile('tickets/ticket-comments-and-file-upload', 'upload', image, model);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    model = store.find('ticket', TD.idOne);
    assert.equal(find(PROGRESS_BAR).length, 1);
    assert.ok(find(PROGRESS_BAR).is(':visible'));
    assert.equal(find(PROGRESS_BAR).attr('style'), 'width: 100%;');
    assert.equal(model.get('attachments').get('length'), 2);
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isDirtyOrRelatedDirty'));
  });
});

test('delete attachment is successful when the user confirms yes (before the file is associated with a ticket)', (assert) => {
  let model = store.find('ticket', TD.idOne);
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  ajax(`${TICKETS_URL}${TD.idOne}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(PROGRESS_BAR).length, 0);
  });
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 201, {});
  uploadFile('tickets/ticket-comments-and-file-upload', 'upload', image, model);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    model = store.find('ticket', TD.idOne);
    assert.equal(find(PROGRESS_BAR).length, 1);
    assert.equal(model.get('attachments').get('length'), 1);
  });
  ajax(ATTACHMENT_DELETE_URL, 'DELETE', null, {}, 204, {});
  click('.t-remove-attachment');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module:'ticket'}));
    });
  });
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      model = store.find('ticket', TD.idOne);
      assert.equal(find(PROGRESS_BAR).length, 0);
      assert.equal(model.get('attachments').get('length'), 0);
    });
  });
});

test('delete attachment is aborted when the user confirms no (before the file is associated with a ticket)', (assert) => {
  let original = window.confirm;
  window.confirm = function() {
    return false;
  };
  let model = store.find('ticket', TD.idOne);
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  ajax(`${TICKETS_URL}${TD.idOne}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(PROGRESS_BAR).length, 0);
  });
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 201, {});
  uploadFile('tickets/ticket-comments-and-file-upload', 'upload', image, model);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    model = store.find('ticket', TD.idOne);
    assert.equal(find(PROGRESS_BAR).length, 1);
    assert.equal(model.get('attachments').get('length'), 1);
  });
  click('.t-remove-attachment');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    model = store.find('ticket', TD.idOne);
    assert.equal(find(PROGRESS_BAR).length, 1);
    assert.equal(model.get('attachments').get('length'), 1);
  });
});

test('user cannot see progress bar for uploaded attachment that is associated with a ticket (after save)', (assert) => {
  let model = store.find('ticket', TD.idOne);
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  ajax(`${TICKETS_URL}${TD.idOne}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(PROGRESS_BAR).length, 0);
  });
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 201, {});
  uploadFile('tickets/ticket-comments-and-file-upload', 'upload', image, model);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    model = store.find('ticket', TD.idOne);
    assert.equal(find(PROGRESS_BAR).length, 1);
    assert.equal(model.get('attachments').get('length'), 1);
    assert.equal(find('.t-remove-attachment').length, 1);
  });
  ajax(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_with_attachment), {}, 200, TF.detail(TD.idOne));
  ajax(`${TICKETS_URL}?page=1`, 'GET', null, {}, 200, TF.list());
  generalPage.save();
  andThen(() => {
    model = store.find('ticket', TD.idOne);
    assert.ok(urlContains(currentURL(), TICKET_URL));
    assert.equal(model.get('attachments').get('length'), 1);
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
  });
  let detail_with_attachment = TF.detail(TD.idOne);
  detail_with_attachment.attachments = [UUID.value];
  ajax(`${TICKETS_URL}${TD.idOne}/`, 'GET', null, {}, 200, detail_with_attachment);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(PROGRESS_BAR).length, 0);
  });
});

test('file upload supports multiple attachments', (assert) => {
  let model = store.find('ticket', TD.idOne);
  let one = {name: 'one.png', type: 'image/png', size: 234000};
  let two = {name: 'two.png', type: 'image/png', size: 124000};
  ajax(`${TICKETS_URL}${TD.idOne}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(PROGRESS_BAR).length, 0);
  });
  patchRandomAsync(0);
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 201, {});
  uploadFile('tickets/ticket-comments-and-file-upload', 'upload', [one, two], model);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(PROGRESS_BAR).length, 2);
    assert.ok(find(PROGRESS_BAR).is(':visible'));
    assert.equal(find(PROGRESS_BAR).attr('style'), 'width: 100%;');
    assert.equal(model.get('attachments').get('length'), 2);
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isDirtyOrRelatedDirty'));
  });
  ajax(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_with_attachments), {}, 200, TF.detail(TD.idOne));
  ajax(`${TICKETS_URL}?page=1`, 'GET', null, {}, 200, TF.list());
  generalPage.save();
  andThen(() => {
    model = store.find('ticket', TD.idOne);
    assert.ok(urlContains(currentURL(), TICKET_URL));
    assert.equal(model.get('attachments').get('length'), 2);
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
  });
});

test('rolling back should only remove files not yet associated with a given ticket', (assert) => {
  let detail_with_attachment = TF.detail(TD.idOne);
  detail_with_attachment.attachments = [TD.attachmentOneId];
  let model = store.find('ticket', TD.idOne);
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  ajax(`${TICKETS_URL}${TD.idOne}/`, 'GET', null, {}, 200, detail_with_attachment);
  page.visitDetail();
  andThen(() => {
    model = store.find('ticket', TD.idOne);
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find(PROGRESS_BAR).length, 0);
    assert.equal(model.get('attachments').get('length'), 1);
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
  });
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 201, {});
  uploadFile('tickets/ticket-comments-and-file-upload', 'upload', image, model);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    model = store.find('ticket', TD.idOne);
    assert.equal(find(PROGRESS_BAR).length, 1);
    assert.ok(find(PROGRESS_BAR).is(':visible'));
    assert.equal(find(PROGRESS_BAR).attr('style'), 'width: 100%;');
    assert.equal(model.get('attachments').get('length'), 2);
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isDirtyOrRelatedDirty'));
  });
  ajax(`${TICKETS_URL}?page=1`, 'GET', null, {}, 200, TF.list());
  visit(TICKET_URL);
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    waitFor(assert, () => {
      assert.equal(find('.t-modal-body').length, 1);
    });
  });
  ajax(`${ATTACHMENTS_URL}batch-delete/`, 'DELETE', {ids: [UUID.value]}, {}, 204, {});
  click('.t-modal-rollback-btn');
  andThen(() => {
    assert.equal(model.get('attachments').get('length'), 1);
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
  });
});

test('when multiple tabs are open only attachments associated with the rollback are removed', (assert) => {
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  ajax(`${TICKETS_URL}${TD.idOne}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(store.find('ticket', TD.idOne).get('attachments').get('length'), 0);
  });
  patchRandomAsync(0);
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 201, {});
  uploadFile('tickets/ticket-comments-and-file-upload', 'upload', image, store.find('ticket', TD.idOne));
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(store.find('ticket', TD.idOne).get('attachments').get('length'), 1);
  });
  ajax(`${TICKETS_URL}?page=1`, 'GET', null, {}, 200, TF.list());
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
  });
  ajax(`/api/tickets/${TD.idTwo}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
  ajax(`${TICKETS_URL}${TD.idTwo}/`, 'GET', null, {}, 200, TF.detail(TD.idTwo));
  visit(DETAIL_TWO_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_TWO_URL);
    assert.equal(store.find('ticket', TD.idTwo).get('attachments').get('length'), 0);
  });
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 201, {});
  uploadFile('tickets/ticket-comments-and-file-upload', 'upload', image, store.find('ticket', TD.idTwo));
  andThen(() => {
    assert.equal(currentURL(), DETAIL_TWO_URL);
    assert.equal(store.find('ticket', TD.idTwo).get('attachments').get('length'), 1);
  });
  ajax(`${TICKETS_URL}?page=1`, 'GET', null, {}, 200, TF.list());
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
  });
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    waitFor(assert, () => {
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.close_tab'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  ajax(`${ATTACHMENTS_URL}batch-delete/`, 'DELETE', {ids: ['abc123']}, {}, 204, {});
  click('.t-modal-rollback-btn');
  andThen(() => {
      // TODO: fix once figure out delete
      assert.equal(store.find('ticket', TD.idOne).get('attachments').get('length'), 0);
      // assert.equal(store.find('ticket', TD.idOne).get('isDirtyOrRelatedDirty'), false);
      // assert.equal(store.find('ticket', TD.idOne).get('attachmentsIsDirty'), false);
      assert.equal(store.find('ticket', TD.idTwo).get('attachments').get('length'), 1);
  });
});

// TODO: see if drag and drop should be supported across all file uploads
skip('bad gateway when saving an attachment (502)', function(assert) {
  let model = store.find('ticket', TD.idOne);
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  ajax(`${TICKETS_URL}${TD.idOne}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 502, 'Server Error');
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL, 'ticket detail url');
    assert.equal(find('app-notice').length, 0, 'no error notification displayed');
    run(() => {
      const event = Ember.$.Event('drop');
      const image = { name: 'foo.png', type: 'image/png', size: 234000 };
      event.dataTransfer = { files: [image] };
      find('.btn-file').trigger(event);
    });
  });
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL, 'url did not change');
    assert.equal(find('app-notice').length, 1, 'error notification displayed');
  });
  click('app-notice');
  andThen(() => {
    assert.equal(find('app-notice').length, 0, 'error notification dismissed');
  });
});
