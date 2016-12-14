import Ember from 'ember';
import { test, skip } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import AD from 'bsrs-ember/vendor/defaults/automation';
import AATD from 'bsrs-ember/vendor/defaults/automation-action-type';
import ED from 'bsrs-ember/vendor/defaults/automation-event';
import AF from 'bsrs-ember/vendor/automation_fixtures';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PersonF from 'bsrs-ember/vendor/people_fixtures';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import page from 'bsrs-ember/tests/pages/automation';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { AUTOMATION_URL, AUTOMATION_LIST_URL, AUTOMATION_EVENTS_URL, AUTOMATION_AVAILABLE_FILTERS_URL, AUTOMATION_ACTION_TYPES_URL, PEOPLE_URL } from 'bsrs-ember/utilities/urls';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_AUTOMATION_URL;
const NEW_URL = `${BASE_URL}/new/1`;
const PD = PERSON_DEFAULTS.defaults();

var listXhr;

moduleForAcceptance('Acceptance | general automation new test', {
  beforeEach() {
    const listData = AF.list();
    listXhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, listData);
    random.uuid = function() { return UUID.value; };
  },
});

/* jshint ignore:start */

test('visit new URL and create a new record', async function(assert) {
  await visit(NEW_URL);
  assert.equal(currentURL(), NEW_URL);
  assert.equal(document.title,  t('doctitle.automation.new'));
  // description
  await page.descriptionFill(AD.descriptionOne);
  assert.equal(page.descriptionValue, AD.descriptionOne);
  // events
  xhr(AUTOMATION_EVENTS_URL, 'GET', null, {}, 200, AF.event_search_power_select());
  await selectChoose('.t-automation-event-select', ED.keyOneValue);
  let v = page.eventSelectedOne;
  assert.equal(page.eventSelectedOne.split('× ')[1], ED.keyOneValue);
  // filter w/ a criteria
  await page.addFilter();
  assert.equal(find('.t-automation-pf-select').length, 1);
  xhr(AUTOMATION_AVAILABLE_FILTERS_URL, 'GET', null, {}, 200, AF.list_pfilters());
  await selectChoose('.t-automation-pf-select:eq(0)', PFD.keyOneTranslated);
  await selectChoose('.t-priority-criteria', TD.priorityOne);
  // action w/ a type
  xhr(AUTOMATION_ACTION_TYPES_URL, 'GET', null, {}, 200, AF.list_action_types());
  await selectChoose('.t-automation-action-type-select', AATD.keyOneTrans);
  assert.equal(page.actionTypeSelectedOne, t(AATD.keyOne));
  assert.equal(Ember.$('.t-automation-action-assignee-select').length, 1);
  // change assignee
  let personData = PersonF.search_power_select();
  let personOneId = personData.results[0].id;
  let personOneFullname = personData.results[0].fullname;
  let keyword = 'a';
  xhr(`${PEOPLE_URL}person__icontains=${keyword}/`, 'GET', null, {}, 200, personData);
  await selectSearch('.t-automation-action-assignee-select', keyword);
  await selectChoose('.t-automation-action-assignee-select', personOneFullname);
  assert.equal(page.actionAssigneeSelectedOne, personOneFullname);
  // POSt
  xhr(AUTOMATION_URL, 'POST', AF.put({
    id: UUID.value,
    events:[ED.idOne],
    actions: [{
      id: UUID.value,
      type: AATD.idOne,
      content: {
        assignee: personOneId
      }
    }],
    filters: [{
      id: UUID.value,
      source: PFD.sourceIdOne,
      criteria: [TD.priorityOneId],
      lookups: {}
    }]
  }), {}, 200, AF.list());
  await generalPage.save();
  assert.equal(currentURL(), AUTOMATION_LIST_URL);
});

test('when user creates an automation they should see an empty action', async function(assert) {
  clearxhr(listXhr);
  await visit(NEW_URL);
  assert.equal(currentURL(), NEW_URL);
  assert.equal(Ember.$('.t-automation-action-type-select .ember-power-select-placeholder').length, 1);
  xhr(AUTOMATION_ACTION_TYPES_URL, 'GET', null, {}, 200, AF.list_action_types());
  await selectChoose('.t-automation-action-type-select', AATD.keyOneTrans);
  assert.equal(page.actionTypeSelectedOne, t(AATD.keyOne));
  assert.equal(Ember.$('.t-automation-action-assignee-select').length, 1);
});

test('when user can visit new automation with, which stats with an empty action widget, and can cancel hit with no modal', async function(assert) {
  await visit(NEW_URL);
  assert.equal(Ember.$('.t-automation-action-type-select .ember-power-select-placeholder').length, 1);
  await generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), AUTOMATION_LIST_URL);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

// cancel modal tests

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', async function(assert) {
  clearxhr(listXhr);
  await visit(NEW_URL);
  await page.descriptionFill(AD.descriptionTwo);
  await generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), NEW_URL);
      assert.ok(generalPage.modalIsVisible);
      assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
    });
  });
  await generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), NEW_URL);
      assert.equal(page.descriptionValue, AD.descriptionTwo);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', function(assert) {
  visit(NEW_URL);
  page.descriptionFill(AD.descriptionTwo);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), NEW_URL);
      assert.ok(generalPage.modalIsVisible);
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), AUTOMATION_LIST_URL);
    });
  });
});

test('clicking cancel button with no edits will take from detail view to list view', async function(assert) {
  await visit(NEW_URL);
  assert.equal(currentURL(), NEW_URL);
  await generalPage.cancel();
  assert.equal(currentURL(), AUTOMATION_LIST_URL);
});

test('validation - at least one event is required, each action must have a type', async function(assert) {
  clearxhr(listXhr);
  await visit(NEW_URL);
  assert.equal(currentURL(), NEW_URL);
  await page.descriptionFill(AD.descriptionTwo);
  assert.equal(currentURL(), NEW_URL);
  // btn disabled
  assert.equal(find('.t-save-btn').attr('disabled'), 'disabled');
  // TODO: user needs to be aware of validation errs
  // assert.equal($('[data-test-id="validation-event0"]').text().trim(), t('errors.automation.event.length'));
  // assert.equal($('[data-test-id="validation-action0"]').text().trim(), t('errors.automation.type'));
  // set to type 'assignee', and should see an 'assignee required msg' b/c assignee not yet selected
  xhr(AUTOMATION_ACTION_TYPES_URL, 'GET', null, {}, 200, AF.list_action_types());
  await selectChoose('.t-automation-action-type-select', AATD.keyOneTrans);
  xhr(`${PEOPLE_URL}person__icontains=a/`, 'GET', null, {}, 200, PersonF.search_power_select());
  await selectSearch('.t-automation-action-assignee-select', 'a');
  await selectChoose('.t-automation-action-assignee-select', PD.fullnameBoy);
  // btn not disabled
  assert.equal(page.actionTypeSelectedOne, AATD.keyOneTrans);
  assert.equal(Ember.$('.t-automation-action-assignee-select').length, 1);
  xhr(AUTOMATION_EVENTS_URL, 'GET', null, {}, 200, AF.event_search_power_select());
  await selectChoose('.t-automation-event-select', ED.keyOneValue);
  assert.equal(find('.t-save-btn').attr('disabled'), undefined);
  assert.equal(Ember.$('.t-automation-event-select').length, 1);
});

test('validation - if type is priority, a ticket priority must be selected', async function(assert) {
  clearxhr(listXhr);
  await visit(NEW_URL);
  assert.equal(currentURL(), NEW_URL);
  assert.equal($('[data-test-id="validation-action0"]').length, 0);
  xhr(AUTOMATION_ACTION_TYPES_URL, 'GET', null, {}, 200, AF.list_action_types());
  await selectChoose('.t-automation-action-type-select', 'Ticket: Priority');
  assert.equal(page.actionTypeSelectedOne, 'Ticket: Priority');
  assert.equal(Ember.$('.t-ticket-priority-select').length, 1);
  await generalPage.save();
  assert.equal(currentURL(), NEW_URL);
  assert.equal($('[data-test-id="validation-action0"]').length, 0);
});

/* jshint ignore:end */
