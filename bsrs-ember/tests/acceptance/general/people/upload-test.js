import Ember from 'ember';
const { run } = Ember;
import { test, skip } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/person';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { PEOPLE_URL, PEOPLE_LIST_URL, ATTACHMENTS_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_people_url;
const DETAIL_URL = BASE_URL + '/' + PD.idOne;
const DETAIL_TWO_URL = BASE_URL + '/' + PD.idTwo;
const PEOPLE_PUT_URL = PREFIX + DETAIL_URL + '/';
const ATTACHMENT_DELETE_URL = ATTACHMENTS_URL + UUID.value + '/';

let store;

moduleForAcceptance('Acceptance | general person file upload test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    random.uuid = function() { return UUID.value; };
  },
});

test('upload will post form data and on save append the attachment', (assert) => {
  let model = store.find('person', PD.idOne);
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  ajax(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 200, PF.detail(PD.idOne));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(store.find('attachment').get('length'), 1);
  });
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 201, {id: UUID.value, image_full: 'wat.jpg', image_medium: 'wat.jpg', image_thumbnail: 'wat.jpg'});
  uploadFile('image-drop', 'handleFileDrop', image, model, 'method');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(store.find('attachment').get('length'), 2);
    assert.equal(model.get('photo').get('id'), UUID.value);
    assert.equal(model.get('photo').get('image_full'), 'wat.jpg');
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isDirtyOrRelatedDirty'));
    assert.equal(find('.image-drop').attr('style'), 'background-image: url(wat.jpg);');
  });
  var payload = PF.put({id: PD.idOne, photo: UUID.value});
  delete payload.auth_currency; // need to figure out why need to do this
  ajax(PEOPLE_PUT_URL, 'PUT', payload, {}, 200, PF.detail(PD.idOne));
  ajax(`${PEOPLE_URL}?page=1`, 'GET', null, {}, 200, PF.list());
  generalPage.save();
  andThen(() => {
    model = store.find('person', PD.idOne);
    assert.equal(currentURL(), PEOPLE_LIST_URL);
    assert.equal(model.get('photo').get('id'), UUID.value);
    assert.equal(model.get('isDirty'), false);
    assert.equal(model.get('isNotDirtyOrRelatedNotDirty'), true);
  });
});

test('uploading a file, then rolling back should throw out any previously associated attachments', (assert) => {
  let model = store.find('person', PD.idOne);
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  ajax(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 200, PF.detail(PD.idOne));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(store.find('attachment').get('length'), 1);
    assert.equal(find('.dirty').length, 0);
  });
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 201, {id: UUID.value});
  uploadFile('image-drop', 'handleFileDrop', image, model, 'method');
  andThen(() => {
    assert.equal(store.find('attachment').get('length'), 2);
    assert.equal(model.get('photo').get('id'), UUID.value);
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
  // TODO:
  // ajax(`${ATTACHMENTS_URL}batch-delete/`, 'DELETE', {ids: [UUID.value]}, {}, 204, {});
  ajax(`${PEOPLE_URL}?page=1`, 'GET', null, {}, 200, PF.list());
  generalPage.clickModalRollback();
  andThen(() => {
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
  });
});

test('previously attached files do not show up after file upload', (assert) => {
  let detail_with_attachment = PF.detail(PD.idOne);
  detail_with_attachment.photo = {id: UUID.value, image_full: 'wat.jpg'};
  let model = store.find('person', PD.idOne);
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  ajax(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 200, detail_with_attachment);
  page.visitDetail();
  andThen(() => {
    model = store.find('person', PD.idOne);
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(store.find('attachment').get('length'), 1);
    assert.equal(model.get('photo').get('id'), UUID.value);
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
  });
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 201, {id: 2});
  uploadFile('image-drop', 'handleFileDrop', image, model, 'method');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    model = store.find('person', PD.idOne);
    assert.equal(store.find('attachment').get('length'), 2);
    assert.equal(model.get('photo').get('id'), 2);
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isDirtyOrRelatedDirty'));
  });
});

skip('delete attachment is successful when the user confirms yes (before the file is associated with a person)', (assert) => {
  let model = store.find('person', PD.idOne);
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  ajax(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 200, PF.detail(PD.idOne));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(store.find('attachment').get('length'), 0);
  });
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 201, {});
  uploadFile('people/detail-section', 'upload', image, model);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    model = store.find('person', PD.idOne);
    assert.equal(store.find('attachment').get('length'), 1);
    assert.equal(model.get('photo').get('id'), UUID.value);
  });
  ajax(ATTACHMENT_DELETE_URL, 'DELETE', null, {}, 204, {});
  click('.t-remove-attachment');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module:'person'}));
    });
  });
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      model = store.find('person', PD.idOne);
      assert.equal(store.find('attachment').get('length'), 0);
      assert.equal(model.get('photo').get('length'), 0);
    });
  });
});

skip('delete attachment is aborted when the user confirms no (before the file is associated with a person)', (assert) => {
  let original = window.confirm;
  window.confirm = function() {
    return false;
  };
  let model = store.find('person', PD.idOne);
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  ajax(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 200, PF.detail(PD.idOne));
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(store.find('attachment').get('length'), 0);
  });
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 201, {});
  uploadFile('people/detail-section', 'upload', image, model);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    model = store.find('person', PD.idOne);
    assert.equal(store.find('attachment').get('length'), 1);
    assert.equal(model.get('photo').get('id'), UUID.value);
  });
  click('.t-remove-attachment');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    model = store.find('person', PD.idOne);
    assert.equal(store.find('attachment').get('length'), 1);
    assert.equal(model.get('photo').get('id'), UUID.value);
  });
});

skip('rolling back should only remove files not yet associated with a given person', (assert) => {
  let detail_with_attachment = PF.detail(PD.idOne);
  detail_with_attachment.attachments = [PD.attachmentOneId];
  let model = store.find('person', PD.idOne);
  let image = {name: 'foo.png', type: 'image/png', size: 234000};
  ajax(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 200, detail_with_attachment);
  page.visitDetail();
  andThen(() => {
    model = store.find('person', PD.idOne);
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(store.find('attachment').get('length'), 1);
    assert.equal(model.get('photo').get('id'), UUID.value);
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
  });
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 201, {});
  uploadFile('people/detail-section', 'upload', image, model);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    model = store.find('person', PD.idOne);
    assert.equal(store.find('attachment').get('length'), 2);
    assert.equal(model.get('photo').get('length'), 2);
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isDirtyOrRelatedDirty'));
  });
  ajax(`${PEOPLE_URL}?page=1`, 'GET', null, {}, 200, PF.list());
  visit(PEOPLE_URL);
  click('.t-tab-close:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_URL);
    waitFor(assert, () => {
      assert.equal(find('.t-modal-body').length, 1);
    });
  });
  ajax(`${ATTACHMENTS_URL}batch-delete/`, 'DELETE', {ids: [UUID.value]}, {}, 204, {});
  click('.t-modal-rollback-btn');
  andThen(() => {
    assert.equal(model.get('photo').get('id'), UUID.value);
    assert.equal(store.find('attachment').get('length'), 1);
    assert.equal(model.get('isDirty'), false);
    assert.ok(model.get('isNotDirtyOrRelatedNotDirty'));
  });
});

test('bad gateway when saving an attachment (502)', function(assert) {
  ajax(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 200, PF.detail(PD.idOne));
  ajax(ATTACHMENTS_URL, 'POST', new FormData(), {}, 502, 'Server Error');
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL, 'person detail url');
    assert.equal(find('app-notice').length, 0, 'no error notification displayed');
    run(() => {
      const event = Ember.$.Event('drop');
      const image = { name: 'foo.png', type: 'image/png', size: 234000 };
      event.dataTransfer = { files: [image] };
      find('.image-drop').trigger(event);
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
