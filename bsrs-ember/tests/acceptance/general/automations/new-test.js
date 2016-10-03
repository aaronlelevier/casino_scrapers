import Ember from 'ember';
import { test } from 'qunit';
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
import PersonF from 'bsrs-ember/vendor/people_fixtures';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import page from 'bsrs-ember/tests/pages/automation';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { AUTOMATION_URL, AUTOMATION_LIST_URL, AUTOMATION_EVENTS_URL, AUTOMATION_AVAILABLE_FILTERS_URL, AUTOMATION_ACTION_TYPES_URL, PEOPLE_URL } from 'bsrs-ember/utilities/urls';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_AUTOMATION_URL;
const NEW_URL = `${BASE_URL}/new/1`;

var store, listXhr;

moduleForAcceptance('Acceptance | automation new test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = AF.list();
    listXhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, listData);
    random.uuid = function() { return UUID.value; };
  },
});

test('visit new URL and create a new record', assert => {
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
  });
  // description
  page.descriptionFill(AD.descriptionOne);
  andThen(() => {
    assert.equal(page.descriptionValue, AD.descriptionOne);
  });
  // events
  xhr(AUTOMATION_EVENTS_URL, 'GET', null, {}, 200, AF.event_search_power_select());
  selectChoose('.t-automation-event-select', ED.keyOneValue);
  andThen(() => {
    let v = page.eventSelectedOne;
    assert.equal(page.eventSelectedOne.split('× ')[1], ED.keyOneValue);
  });
  // filter w/ a criteria
  page.addFilter();
  andThen(() => {
    assert.equal(find('.t-automation-pf-select').length, 1);
  });
  xhr(AUTOMATION_AVAILABLE_FILTERS_URL, 'GET', null, {}, 200, AF.list_pfilters());
  selectChoose('.t-automation-pf-select:eq(0)', PFD.keyOneTranslated);
  selectChoose('.t-priority-criteria', TD.priorityOne);
  // action w/ a type
  xhr(AUTOMATION_ACTION_TYPES_URL, 'GET', null, {}, 200, AF.action_search_power_select());
  selectChoose('.t-automation-action-type-select', AATD.keyOne);
  andThen(() => {
    assert.equal(page.actionTypeSelectedOne, AATD.keyOne);
    assert.equal(Ember.$('.t-automation-action-assignee-select').length, 1);
  });
    // change assignee
  let personData = PersonF.search_power_select();
  let personOneId = personData.results[0].id;
  let personOneFullname = personData.results[0].fullname;
  let keyword = 'a';
  xhr(`${PEOPLE_URL}person__icontains=${keyword}/`, 'GET', null, {}, 200, personData);
  selectSearch('.t-automation-action-assignee-select', keyword);
  selectChoose('.t-automation-action-assignee-select', personOneFullname);
  andThen(() => {
    assert.equal(page.actionAssigneeSelectedOne, personOneFullname);
  });
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
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
});

test('when user creates an automation they should see an empty action', assert => {
  clearxhr(listXhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    assert.equal(Ember.$('.t-automation-action-type-select .ember-power-select-placeholder').length, 1);
  });
  xhr(AUTOMATION_ACTION_TYPES_URL, 'GET', null, {}, 200, AF.action_search_power_select());
  selectChoose('.t-automation-action-type-select', AATD.keyOne);
  andThen(() => {
    assert.equal(page.actionTypeSelectedOne, AATD.keyOne);
    assert.equal(Ember.$('.t-automation-action-assignee-select').length, 1);
  });
});

test('when user can visit new automation with, which stats with an empty action widget, and can cancel hit with no modal', assert => {
  visit(NEW_URL);
  andThen(() => {
    assert.equal(Ember.$('.t-automation-action-type-select .ember-power-select-placeholder').length, 1);
  });
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), AUTOMATION_LIST_URL);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

// cancel modal tests

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
  clearxhr(listXhr);
  visit(NEW_URL);
  page.descriptionFill(AD.descriptionTwo);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), NEW_URL);
      assert.ok(generalPage.modalIsVisible);
      assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
    });
  });
  generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), NEW_URL);
      assert.equal(page.descriptionValue, AD.descriptionTwo);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
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

test('clicking cancel button with no edits will take from detail view to list view', (assert) => {
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
});

test('validation - at least one event is required, each action must have a type', assert => {
  clearxhr(listXhr);
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    assert.equal($('.validated-input-error-dialog').length, 0);
  });
  page.descriptionFill(AD.descriptionTwo);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    assert.equal($('.validated-input-error-dialog').length, 2);
    assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), t('errors.automation.event.length'));
    assert.equal($('.validated-input-error-dialog:eq(1)').text().trim(), t('errors.automation.type'));
  });
  // set to type 'assignee', and should see an 'assignee required msg' b/c assignee not yet selected
  xhr(AUTOMATION_ACTION_TYPES_URL, 'GET', null, {}, 200, AF.action_search_power_select());
  selectChoose('.t-automation-action-type-select', AATD.keyOne);
  andThen(() => {
    assert.equal(page.actionTypeSelectedOne, AATD.keyOne);
    assert.equal(Ember.$('.t-automation-action-assignee-select').length, 1);
  });
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
    assert.equal($('.validated-input-error-dialog').length, 2);
    assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), t('errors.automation.event.length'));
    assert.equal($('.validated-input-error-dialog:eq(1)').text().trim(), t('errors.automation.type.assignee'));
  });
});
