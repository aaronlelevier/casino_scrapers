import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import { dtd_payload, dtd_payload_two, dtd_payload_link_two_put, dtd_payload_update_priority, dtd_payload_no_priority, dtd_new_payload } from 'bsrs-ember/tests/helpers/payloads/dtd';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import LINK from 'bsrs-ember/vendor/defaults/link';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/dtd';
import generalPage from 'bsrs-ember/tests/pages/general';
import ticketPage from 'bsrs-ember/tests/pages/tickets';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_dtd_url;
const DTD_URL = `${BASE_URL}`;
const DETAIL_URL = `${BASE_URL}/${DTD.idOne}`;
const DT_PUT_URL = `${PREFIX}${DETAIL_URL}/`;
const BACKSPACE = {keyCode: 8};
const DTD_ERROR_URL = BASEURLS.dtd_error_url;
const PAGE_SIZE = config.APP.PAGE_SIZE;

let application, store, endpoint, list_xhr, detail_xhr, detail_data, original_uuid;

module('Acceptance | dtd detail', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('store:main');
    endpoint = `${PREFIX}${BASE_URL}/`;
    list_xhr = xhr(`${endpoint}?page=1`, 'GET', null, {}, 200, DTDF.list());
    detail_data = DTDF.detail(DTD.idOne);
    detail_xhr = xhr(`${endpoint}${DTD.idOne}/`, 'GET', null, {}, 200, detail_data);
    original_uuid = random.uuid;
  },
  afterEach() {
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

test('decision tree definition displays data and does not update nor transitions if not dirty model', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-dtd-single-key').val(), DTD.keyOne);
    assert.equal(find('.t-dtd-single-description').val(), DTD.descriptionOne);
    assert.equal(find('.t-dtd-prompt').val(), DTD.promptOne);
    assert.equal(find('.t-dtd-note').val(), DTD.noteOne);
    assert.equal(find('.t-dtd-link-action_button').prop('checked'), LINK.action_buttonOne);
    assert.equal(find('.t-dtd-link-request').val(), LINK.requestOne);
    assert.equal(ticketPage.priorityInput.split(' ')[0], TP.priorityOne);
    assert.equal(ticketPage.statusInput.split(' ')[0], TD.statusOne);
  });
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('dtd payload change priority only', (assert) => {
  page.visitDetail();
  andThen(() => {
    const dtd = store.find('dtd', DTD.idOne);
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(dtd.get('linksIsNotDirty'));
    const link = dtd.get('links').objectAt(0);
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(link.get('priorityIsNotDirty'));
  });
  ticketPage
  .priorityClickDropdown()
  .priorityClickOptionTwo();
  andThen(() => {
    assert.equal(ticketPage.priorityInput.split(' ')[0], TP.priorityTwo);
    const dtd = store.find('dtd', DTD.idOne);
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    assert.ok(dtd.get('linksIsDirty'));
    const link = dtd.get('links').objectAt(0);
    assert.ok(link.get('isDirtyOrRelatedDirty'));
    assert.ok(link.get('priorityIsDirty'));
  });
  xhr(DT_PUT_URL, 'PUT', JSON.stringify(dtd_payload_update_priority), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('dtd payload to update all fields', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.ok(find('.t-dtd-link-action_button').prop('checked'));
  });
  page
  .keyFillIn(DTD.keyTwo)
  .descriptionFillIn(DTD.descriptionTwo)
  .promptFillIn(DTD.promptTwo)
  .noteFillIn(DTD.noteTwo)
  .requestFillIn(LINK.requestTwo)
  .textFillIn(LINK.textTwo)
  .action_buttonClick()
  .linkTypeTwoClick()
  .noteTypeClickDropdown()
  .noteTypeClickOptionTwoValue();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-dtd-single-key').val(), DTD.keyTwo);
    assert.equal(find('.t-dtd-single-description').val(), DTD.descriptionTwo);
    assert.equal(find('.t-dtd-prompt').val(), DTD.promptTwo);
    assert.equal(find('.t-dtd-note').val(), DTD.noteTwo);
    assert.equal(page.noteTypeInput, DTD.noteTypeTwoValue);
    assert.notOk(find('.t-dtd-link-action_button').prop('checked'));
    assert.equal(find('.t-dtd-link-request').val(), LINK.requestTwo);
    assert.equal(find('.t-dtd-link-text').val(), LINK.textTwo);
  });
  ticketPage.priorityClickDropdown();
  andThen(() => {
    assert.equal(ticketPage.priorityOne, TP.priorityOne);
    assert.equal(ticketPage.priorityTwo, TP.priorityTwo);
    assert.equal(ticketPage.priorityThree, TP.priorityThree);
    assert.equal(ticketPage.priorityFour, TP.priorityFour);
  });
  ticketPage.priorityClickOptionTwo();
  ticketPage.statusClickDropdown();
  ticketPage.statusClickOptionTwo();
  andThen(() => {
    assert.equal(ticketPage.priorityInput.split(' ')[0], TP.priorityTwo);
  });
  xhr(DT_PUT_URL, 'PUT', JSON.stringify(dtd_payload_two), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('add a new field and update', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  page.addFieldBtn();
  andThen(() => {
    assert.equal(page.fieldLabelTwo, '');
    assert.equal(page.fieldTypeTwo, FD.typeOneValue);
    assert.ok(page.fieldRequiredTwoNotChecked);
  });
  // label
  page.fieldLabelTwoFillin(FD.labelOne);
  andThen(() => {
    assert.equal(page.fieldLabelTwo, FD.labelOne);
  });
  // required
  assert.ok(page.fieldRequiredTwoNotChecked);
  page.fieldRequiredTwoClick();
  assert.ok(page.fieldRequiredTwoChecked);
  // type
  page.fieldTypeTwoClickDropdown();
  page.fieldTypeTwoClickOptionFour();
  andThen(() => {
    assert.equal(page.fieldTypeTwo, FD.typeFourValue);
  });
  // Option
  page.fieldTwoAddFieldOption();
  page.fieldTwoOptionTextFillin(OD.textOne);
  andThen(() => {
    assert.equal(page.fieldTwoOptionText, OD.textOne);
  });
  // payload
  random.uuid = function() { return UUID.value; };
  dtd_payload['fields'].push({
    id: 1,
    label: FD.labelOne,
    type: FD.typeFour,
    required: true,
    options: [{id: 1, text: OD.textOne, order: null}]
  });
  xhr(DT_PUT_URL, 'PUT', JSON.stringify(dtd_payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('dtd can clear out link priority', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(ticketPage.priorityInput.split(' ')[0], TP.priorityOne);
  });
  ticketPage.removePriority();
  andThen(() => {
    assert.equal(ticketPage.priorityInput.split(' ')[0], '');
  });
  xhr(DT_PUT_URL, 'PUT', JSON.stringify(dtd_payload_no_priority), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('click modal cancel (dtd)', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.ok(find('.t-dtd-link-action_button').prop('checked'));
  });
  page
  .keyFillIn(DTD.keyTwo)
  .descriptionFillIn(DTD.descriptionTwo)
  .promptFillIn(DTD.promptTwo)
  .noteFillIn(DTD.noteTwo)
  .requestFillIn(LINK.requestTwo)
  .action_buttonClick();
  generalPage.cancel();
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
      assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
    });
  });
  generalPage.clickModalCancel();
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('click modal ok (dtd)', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.ok(find('.t-dtd-link-action_button').prop('checked'));
  });
  page
  .keyFillIn(DTD.keyTwo)
  .descriptionFillIn(DTD.descriptionTwo)
  .promptFillIn(DTD.promptTwo)
  .noteFillIn(DTD.noteTwo)
  .requestFillIn(LINK.requestTwo)
  .action_buttonClick();
  generalPage.cancel();
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
      assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('clicking cancel button will take from detail view to list view', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(),DETAIL_URL);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  page.visitDetail();
  ticketPage.priorityClickDropdown();
  ticketPage.priorityClickOptionTwo();
  generalPage.cancel();
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DETAIL_URL);
    });
  });
});

// test('when click delete, dtd is deleted and removed from store', (assert) => {
//   page.visitDetail();
//   xhr(PREFIX + BASE_URL + '/' + DTD.idOne + '/', 'DELETE', null, {}, 204, {});
//   generalPage.delete();
//   andThen(() => {
//     assert.equal(currentURL(), DTD_URL);
//     assert.equal(store.find('dtd', DTD.idOne).get('length'), undefined);
//   });
// });

test('click add-link, and fill in', (assert) => {
  random.uuid = function() { return UUID.value; };
  page.visitDetail();
  andThen(() => {
    assert.ok(find('.t-dtd-link-action_button').prop('checked'));
    assert.equal(page.textCount, 1);
  });
  page.clickAddLinkBtn();
  andThen(() => {
    assert.equal(page.textCount, 2);
  });
  page
  .requestFillIn_two(LINK.requestTwo)
  .textFillIn_two(LINK.textTwo)
  .action_buttonClick_two();
  xhr(DT_PUT_URL, 'PUT', JSON.stringify(dtd_payload_link_two_put), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

/* jshint ignore:start */
test('deep linking with an xhr with a 404 status code will show up in the error component (dtd)', async assert => {
    clearxhr(detail_xhr);
    const exception = `This record does not exist.`;
    xhr(`${endpoint}${DTD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
    await page.visitDetail();
    assert.equal(currentURL(), DTD_ERROR_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-error-message').text(), 'WAT');
});
/* jshint ignore:end */
