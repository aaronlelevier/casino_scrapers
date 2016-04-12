import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
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
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
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

let application, store, payload, list_xhr, original_uuid;

module('Acceptance | dtd-new', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('store:main');
    list_xhr = xhr(`${DJANGO_DTD_URL}?page=1`, 'GET', null, {}, 201, DTDF.empty());
    original_uuid = random.uuid;
    random.uuid = function() { return UUID.value; };
  },
  afterEach() {
    payload = null;
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

/* jshint ignore:start */

test('visiting /dtd/new', async assert => {
  await page.visit();
  assert.equal(currentURL(), DTD_URL);
  await click('.t-add-new');
  assert.equal(currentURL(), DTD_NEW_URL);
  assert.equal(store.find('dtd').get('length'), 1);
  const dtd = store.find('dtd', UUID.value);
  assert.ok(dtd.get('new'));
  assert.notOk(dtd.get('key'));
  assert.notOk(dtd.get('description'));
  assert.notOk(find('t-dtd-empty-detail').text());
  assert.equal(page.titleText, t('admin.dtd.new'));
  page.keyFillIn(DTD.keyOne);
  page.descriptionFillIn(DTD.descriptionOne);
  const json = { 'results': [{id: DTD.idOne, key: DTD.keyOne}, {id: DTD.idTwo, key: DTD.keyTwo}] };
  ajax(`/api/dtds/?key__icontains=1`, 'GET', null, {}, 200, json);
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
  .statusClickOptionOne()
  assert.equal(ticketPage.priorityInput.split(' ')[0], TP.priorityOne);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  assert.ok(dtd.get('linksIsDirty'));
  const link = dtd.get('links').objectAt(0);
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  assert.ok(link.get('priorityIsDirty'));
  const response = Ember.$.extend(true, {}, payload);
  xhr(DJANGO_DTD_URL, 'POST', JSON.stringify(dtd_new_payload), {}, 201, response);
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

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
  page.visitNew();
  page.keyFillIn(DTD.keyOne);
  generalPage.cancel();
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DTD_NEW_URL);
      assert.equal(find('.t-modal').is(':visible'), true);
      assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
    });
  });
  click('.t-modal-footer .t-modal-cancel-btn');
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DTD_NEW_URL);
      assert.equal(page.key, DTD.keyOne);
      assert.equal(find('.t-modal').is(':hidden'), true);
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
  page.visitNew();
  page.keyFillIn(DTD.keyOne);
  generalPage.cancel();
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DTD_NEW_URL);
      assert.equal(find('.t-modal').is(':visible'), true);
      let dtds = store.find('dtd');
      assert.equal(dtds.get('length'), 1);
    });
  });
  click('.t-modal-footer .t-modal-rollback-btn');
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DTD_URL);
      let dtds = store.find('dtd');
      assert.equal(dtds.get('length'), 0);
      assert.equal(find('tr.t-grid-data').length, 0);
    });
  });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
  page.visitNew();
  generalPage.cancel();
  andThen(() => {
    assert.equal(store.find('dtd').get('length'), 0);
  });
});

// test('scott adding a new dtd should allow for another new dtd to be created after the first is persisted', (assert) => {
//   let dtd_count;
//   random.uuid = original_uuid;
//   dtd_new_payload.id = 'abc123';
//   patchRandomAsync(0);
//   visit(DTD_URL);
//   click('.t-add-new');
//   page.keyFillIn(DTD.keyOne);
//   page.descriptionFillIn(DTD.descriptionOne);
//   xhr(DJANGO_DTD_URL, 'POST', JSON.stringify(dtd_new_payload), {}, 201, Ember.$.extend(true, {}, payload));
//   generalPage.save();
//   andThen(() => {
//     assert.equal(currentURL(), '/dtds/abc123');
//   });
//   click('.t-add-new');
//   andThen(() => {
//     assert.equal(currentURL(), DTD_NEW_URL);
//   });
// });

// test('dtd payload to update all fields', (assert) => {
//   page.visitNew();
//   andThen(() => {
//     assert.ok(find('.t-dtd-link-action_button').prop('checked'));
//   });
//   page
//   .keyFillIn(DTD.keyTwo)
//   .descriptionFillIn(DTD.descriptionTwo)
//   .promptFillIn(DTD.promptTwo)
//   .noteFillIn(DTD.noteTwo)
//   .requestFillIn(LINK.requestTwo)
//   .textFillIn(LINK.textTwo)
//   .action_buttonClick()
//   .linkTypeTwoClick()
//   .noteTypeClickDropdown()
//   .noteTypeClickOptionTwoValue();
//   andThen(() => {
//     assert.equal(currentURL(), NEW_URL);
//     assert.equal(find('.t-dtd-single-key').val(), DTD.keyTwo);
//     assert.equal(find('.t-dtd-single-description').val(), DTD.descriptionTwo);
//     assert.equal(find('.t-dtd-prompt').val(), DTD.promptTwo);
//     assert.equal(find('.t-dtd-note').val(), DTD.noteTwo);
//     assert.equal(page.noteTypeInput, DTD.noteTypeTwoValue);
//     assert.notOk(find('.t-dtd-link-action_button').prop('checked'));
//     assert.equal(find('.t-dtd-link-request').val(), LINK.requestTwo);
//     assert.equal(find('.t-dtd-link-text').val(), LINK.textTwo);
//   });
//   ticketPage.priorityClickDropdown();
//   andThen(() => {
//     assert.equal(ticketPage.priorityOne, TP.priorityOne);
//     assert.equal(ticketPage.priorityTwo, TP.priorityTwo);
//     assert.equal(ticketPage.priorityThree, TP.priorityThree);
//     assert.equal(ticketPage.priorityFour, TP.priorityFour);
//   });
//   ticketPage.priorityClickOptionTwo();
//   ticketPage.statusClickDropdown();
//   ticketPage.statusClickOptionTwo();
//   andThen(() => {
//     assert.equal(ticketPage.priorityInput.split(' ')[0], TP.priorityTwo);
//   });
//   xhr(DTD_PUT_URL, 'PUT', JSON.stringify(dtd_payload_two), {}, 200, {});
//   generalPage.save();
//   andThen(() => {
//     assert.equal(currentURL(), NEW_URL);
//   });
// });

// test('add a new field and update', (assert) => {
//   page.visitNew();
//   andThen(() => {
//     assert.equal(currentURL(), NEW_URL);
//   });
//   page.addFieldBtn();
//   andThen(() => {
//     assert.equal(page.fieldLabelTwo, '');
//     assert.equal(page.fieldTypeTwo, FD.typeOneValue);
//     assert.ok(page.fieldRequiredTwoNotChecked);
//   });
//   // label
//   page.fieldLabelTwoFillin(FD.labelOne);
//   andThen(() => {
//     assert.equal(page.fieldLabelTwo, FD.labelOne);
//   });
//   // required
//   assert.ok(page.fieldRequiredTwoNotChecked);
//   page.fieldRequiredTwoClick();
//   assert.ok(page.fieldRequiredTwoChecked);
//   // type
//   page.fieldTypeTwoClickDropdown();
//   page.fieldTypeTwoClickOptionFour();
//   andThen(() => {
//     assert.equal(page.fieldTypeTwo, FD.typeFourValue);
//   });
//   // Option
//   page.fieldTwoAddFieldOption();
//   page.fieldTwoOptionTextFillin(OD.textOne);
//   andThen(() => {
//     assert.equal(page.fieldTwoOptionText, OD.textOne);
//   });
//   // payload
//   random.uuid = function() { return UUID.value; };
//   dtd_payload['fields'].push({
//     id: 1,
//     label: FD.labelOne,
//     type: FD.typeFour,
//     required: true,
//     options: [{id: 1, text: OD.textOne, order: null}]
//   });
//   xhr(DTD_PUT_URL, 'PUT', JSON.stringify(dtd_payload), {}, 200, {});
//   generalPage.save();
//   andThen(() => {
//     assert.equal(currentURL(), NEW_URL);
//   });
// });

// test('dtd can clear out link priority', (assert) => {
//   page.visitNew();
//   andThen(() => {
//     assert.equal(currentURL(), NEW_URL);
//     assert.equal(ticketPage.priorityInput.split(' ')[0], TP.priorityOne);
//   });
//   page.removePriority();
//   andThen(() => {
//     assert.equal(ticketPage.priorityInput.split(' ')[0], '');
//   });
//   xhr(DTD_PUT_URL, 'PUT', JSON.stringify(dtd_payload_no_priority), {}, 200, {});
//   generalPage.save();
//   andThen(() => {
//     assert.equal(currentURL(), NEW_URL);
//   });
// });

// test('dtd can clear out link status', (assert) => {
//   page.visitNew();
//   andThen(() => {
//     assert.equal(currentURL(), NEW_URL);
//     assert.equal(ticketPage.statusInput.split(' ')[0], TD.statusOne);
//   });
//   page.removeStatus();
//   andThen(() => {
//     assert.equal(ticketPage.statusInput.split(' ')[0], '');
//   });
//   xhr(DTD_PUT_URL, 'PUT', JSON.stringify(dtd_payload_no_status), {}, 200, {});
//   generalPage.save();
//   andThen(() => {
//     assert.equal(currentURL(), NEW_URL);
//   });
// });

/* jshint ignore:end */
