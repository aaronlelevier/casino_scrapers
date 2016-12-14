import Ember from 'ember';
import { test, skip } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';
import LINK from 'bsrs-ember/vendor/defaults/link';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import BASEURLS from 'bsrs-ember/utilities/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import ticketPage from 'bsrs-ember/tests/pages/tickets';
import page from 'bsrs-ember/tests/pages/dtd';
import random from 'bsrs-ember/models/random';
import { dtd_new_payload } from 'bsrs-ember/tests/helpers/payloads/dtd';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_dtd_url;
const DTD_URL = `${BASE_URL}`;
const DTD_NEW_URL = `${BASE_URL}/new/1`;
const DTD_NEW_URL_2 = `${BASE_URL}/new/2`;
const DJANGO_DTD_URL = `${PREFIX}/dtds/`;
const NEW_URL = `${BASE_URL}/${UUID.value}`;
const DJANGO_DTD_NEW_URL = `${DJANGO_DTD_URL}${UUID.value}/`;
const DTD_ERROR_URL = BASEURLS.dtd_error_url;
const PAGE_SIZE = config.APP.PAGE_SIZE;

moduleForAcceptance('Acceptance | general dtd-new', {
  beforeEach() {
    xhr(`${DJANGO_DTD_URL}?page=1`, 'GET', null, {}, 201, DTDF.list());
    random.uuid = function() { return UUID.value; };
  },
});

/* jshint ignore:start */

test('visiting /dtd/new', async function(assert) {
  await page.visit();
  assert.equal(currentURL(), DTD_URL);
  await click('.t-add-new');
  assert.equal(currentURL(), DTD_NEW_URL);
  assert.equal(this.store.find('dtd').get('length'), 1);
  const dtd = this.store.find('dtd', UUID.value);
  assert.ok(dtd.get('new'));
  assert.notOk(dtd.get('key'));
  assert.notOk(dtd.get('description'));
  assert.notOk(find('t-dtd-empty-detail').text());
  assert.equal(page.titleText, t('admin.dtd.new'));
  page.keyFillIn(DTD.keyOne);
  page.descriptionFillIn(DTD.descriptionOne);
  const json = { 'results': [{id: DTD.idOne, key: DTD.keyOne}, {id: DTD.idTwo, key: DTD.keyTwo}] };
  xhr(`/api/dtds/?search=1`, 'GET', null, {}, 200, json);
  await page.requestFillIn(LINK.requestOne)
  .textFillIn(LINK.textOne)
  .linkTypeOneClick()
  .destinationClickDropdownOne()
  .destinationSearch('1')
  .destinationClickOptionOne()
  .addFieldBtn()
  .fieldLabelOneFillin(FD.labelOne)
  .fieldRequiredOneClick()
  .fieldTypeOneClickDropdown()
  .fieldTypeOneClickOptionFour()
  .fieldOneAddFieldOption()
  .fieldOneOptionTextFillin(OD.textOne)
  .action_buttonClick();
  await ticketPage
  .priorityClickDropdown()
  .priorityClickOptionOne()
  .statusClickDropdown()
  .statusClickOptionOne();
  assert.equal(ticketPage.priorityInput.split(' ')[0], TP.priorityOne);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  assert.ok(dtd.get('linksIsDirty'));
  const link = dtd.get('links').objectAt(0);
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  assert.ok(link.get('priorityIsDirty'));
  xhr(DJANGO_DTD_URL, 'POST', JSON.stringify(dtd_new_payload), {}, 201, {});
  await generalPage.save();
  assert.equal(currentURL(), NEW_URL);
  assert.equal(dtd.get('key'), DTD.keyOne);
  assert.equal(dtd.get('description'), DTD.descriptionOne);
  assert.ok(dtd.get('isNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(dtd.get('linksIsNotDirty'));
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.notOk(link.get('fieldsIsDirtyContainer'));
  assert.ok(link.get('priorityIsNotDirty'));
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', function(assert) {
  page.visitNew();
  page.keyFillIn(DTD.keyOne);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DTD_NEW_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  click('.t-modal-footer .t-modal-cancel-btn');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DTD_NEW_URL);
      assert.equal(page.key, DTD.keyOne);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from this.store', function(assert) {
  page.visitNew();
  page.keyFillIn(DTD.keyOne);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DTD_NEW_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
      let dtds = this.store.find('dtd');
      assert.equal(dtds.get('length'), 1);
    });
  });
  click('.t-modal-footer .t-modal-rollback-btn');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DTD_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
      let dtds = this.store.find('dtd');
      assert.equal(dtds.get('length'), 0);
      assert.equal(find('tr.t-grid-data').length, 10);
    });
  });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the this.store', async function(assert) {
  await page.visitNew();
  await generalPage.cancel();
  assert.equal(this.store.find('dtd').get('length'), 0);
});

test('adding a new dtd should allow for another new dtd to be created after the first is persisted', async function(assert) {
  await visit(DTD_URL);
  await click('.t-add-new');
  page.keyFillIn(DTD.keyOne);
  page.descriptionFillIn(DTD.descriptionOne);
  const json = { 'results': [{id: DTD.idOne, key: DTD.keyOne}, {id: DTD.idTwo, key: DTD.keyTwo}] };
  xhr(`/api/dtds/?search=1`, 'GET', null, {}, 200, json);
  await page.requestFillIn(LINK.requestOne)
  .textFillIn(LINK.textOne)
  .linkTypeOneClick()
  .destinationClickDropdownOne()
  .destinationSearch('1')
  .destinationClickOptionOne()
  .addFieldBtn()
  .fieldLabelOneFillin(FD.labelOne)
  .fieldRequiredOneClick()
  .fieldTypeOneClickDropdown()
  .fieldTypeOneClickOptionFour()
  .fieldOneAddFieldOption()
  .fieldOneOptionTextFillin(OD.textOne)
  .action_buttonClick();
  await ticketPage
  .priorityClickDropdown()
  .priorityClickOptionOne()
  .statusClickDropdown()
  .statusClickOptionOne();
  xhr(DJANGO_DTD_URL, 'POST', JSON.stringify(dtd_new_payload), {}, 201, {});
  await generalPage.save();
  assert.equal(currentURL(), NEW_URL);
  await click('.t-add-new');
  assert.equal(currentURL(), DTD_NEW_URL);
});

skip('400 error redirects to dtd-error route', async function(assert) {
  await page.visit();
  await click('.t-add-new');
  page.keyFillIn(DTD.keyOne);
  page.descriptionFillIn(DTD.descriptionOne);
  const json = { 'results': [{id: DTD.idOne, key: DTD.keyOne}, {id: DTD.idTwo, key: DTD.keyTwo}] };
  xhr(`/api/dtds/?search=1`, 'GET', null, {}, 200, json);
  await page.requestFillIn(LINK.requestOne)
  .textFillIn(LINK.textOne)
  .linkTypeOneClick()
  .destinationClickDropdownOne()
  .destinationSearch('1')
  .destinationClickOptionOne()
  .addFieldBtn()
  .fieldLabelOneFillin(FD.labelOne)
  .fieldRequiredOneClick()
  .fieldTypeOneClickDropdown()
  .fieldTypeOneClickOptionFour()
  .fieldOneAddFieldOption()
  .fieldOneOptionTextFillin(OD.textOne)
  .action_buttonClick();
  await ticketPage
  .priorityClickDropdown()
  .priorityClickOptionOne()
  .statusClickDropdown()
  .statusClickOptionOne();
  const exception = 'Saving this record failed';
  xhr(`${PREFIX}${BASE_URL}/`, 'POST', dtd_new_payload, {}, 400, {'detail': exception});
  await generalPage.save();
  assert.equal(currentURL(), DTD_ERROR_URL);
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(find('.t-error-message').text(), 'WAT');
});

/* jshint ignore:end */
