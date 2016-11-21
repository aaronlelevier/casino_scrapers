import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import AD from 'bsrs-ember/vendor/defaults/automation';
import AAD from 'bsrs-ember/vendor/defaults/automation-action';
import AATD from 'bsrs-ember/vendor/defaults/automation-action-type';
import AF from 'bsrs-ember/vendor/automation_fixtures';
import ED from 'bsrs-ember/vendor/defaults/automation-event';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CountryF from 'bsrs-ember/vendor/country_fixtures';
import SF from 'bsrs-ember/vendor/state_fixtures';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TPD from 'bsrs-ember/vendor/defaults/ticket-priority';
import TSD from 'bsrs-ember/vendor/defaults/ticket-status';
import SED from 'bsrs-ember/vendor/defaults/sendemail';
import SMSD from 'bsrs-ember/vendor/defaults/sendsms';
import page from 'bsrs-ember/tests/pages/automation';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { AUTOMATION_URL, AUTOMATION_LIST_URL, AUTOMATION_EVENTS_URL, AUTOMATION_AVAILABLE_FILTERS_URL, PEOPLE_URL, AUTOMATION_ACTION_TYPES_URL } from 'bsrs-ember/utilities/urls';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_AUTOMATION_URL;
const DETAIL_URL = `${BASE_URL}/${AD.idOne}`;
const API_DETAIL_URL = `${AUTOMATION_URL}${AD.idOne}/`;

var store, detailXhr, listXhr;

moduleForAcceptance('Acceptance | general automation detail test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = AF.list();
    listXhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, listData);
    const detailData = AF.detail();
    detailXhr = xhr(API_DETAIL_URL, 'GET', null, {}, 200, detailData);
    // random.uuid = function() { return UUID.value; };
  },
});

test('by clicking record in list view, User is sent to detail view', assert => {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
});

test('detail and update all fields', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.descriptionValue, AD.descriptionOne);
    assert.equal(page.eventSelectedOne.replace('× ', ''), t(ED.keyOne));
    assert.equal(find('.t-automation-pf-select .ember-power-select-selected-item').text().trim(), t(PFD.keyOne));
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], t(TD.priorityOneKey));
  });
  // criteria
  selectChoose('.t-priority-criteria', TD.priorityTwo);
  andThen(() => {
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], t(TD.priorityOneKey));
    assert.equal(page.prioritySelectedTwo.split(/\s+/)[1], t(TD.priorityTwoKey));
  });
  // description
  page.descriptionFill(AD.descriptionTwo);
  andThen(() => {
    assert.equal(page.descriptionValue, AD.descriptionTwo);
    const automation = store.find('automation', AD.idOne);
    assert.equal(automation.get('description'), AD.descriptionTwo);
  });
  // events
  xhr(AUTOMATION_EVENTS_URL, 'GET', null, {}, 200, AF.event_search_power_select());
  selectChoose('.t-automation-event-select', ED.keyTwoValue);
  andThen(() => {
    assert.equal(page.eventSelectedOne.split('× ')[1], ED.keyOneValue);
    assert.equal(page.eventSelectedTwo.split('× ')[1], ED.keyTwoValue);
  });
  // pfilters
  xhr(AUTOMATION_AVAILABLE_FILTERS_URL, 'GET', null, {}, 200, AF.list_pfilters());
  page.addFilter();
  let keyword = 'a';
  selectChoose('.t-automation-pf-select:eq(1)', PFD.keyTwo);
  xhr(`/api/admin/locations/location__icontains=${keyword}/?location_level=${PFD.lookupsDynamic.id}`, 'GET', null, {}, 200, LF.search_power_select());
  selectSearch('.t-ticket-location-select', keyword);
  selectChoose('.t-ticket-location-select', LD.storeNameFour);
  andThen(() => {
    assert.equal(page.locationSelectedOne.split(/\s+/)[1], LD.storeNameFour);
  });
  clearxhr(listXhr);
  // let payload = AF.put({
  //   description: AD.descriptionTwo,
  //   events: [ED.idOne, ED.idTwo],
  //   filters: [{
  //     id: PFD.idOne,
  //     source: PFD.sourceIdOne,
  //     criteria: [TD.priorityOneId, TD.priorityTwoId],
  //     lookups: {}
  //   }, {
  //     id: UUID.value,
  //     source: PFD.sourceIdTwo,
  //     criteria: [LD.idFour],
  //     lookups: PFD.lookupsDynamic
  //   }]
  // });
  // xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  // generalPage.save();
  // andThen(() => {
  //   assert.equal(currentURL(), AUTOMATION_LIST_URL);
  // });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
  clearxhr(listXhr);
  page.visitDetail();
  page.descriptionFill(AD.descriptionTwo);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
      assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
    });
  });
  generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(page.descriptionValue, AD.descriptionTwo);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('when user adds a filter and hits cancel they are prompted with a modal', (assert) => {
  clearxhr(listXhr);
  page.visitDetail();
  // a filter is added here, but it's empty, so the automation is still considered
  // clean, and can cancel w/o getting the modal prompt.
  andThen(() => {
    assert.equal(store.find('automation', AD.idOne).get('pf').get('length'), 1);
  });
  page.addFilter();
  andThen(() => {
    assert.equal(store.find('automation', AD.idOne).get('pf').get('length'), 2);
  });
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(store.find('automation', AD.idOne).get('pf').get('length'), 2);
      assert.ok(generalPage.modalIsVisible);
    });
  });
});

test('when user adds a filter and selects an available filter they are prompted with a modal', (assert) => {
  clearxhr(listXhr);
  page.visitDetail();
  page.addFilter();
  xhr(`${AUTOMATION_AVAILABLE_FILTERS_URL}`, 'GET', null, {}, 200, AF.list_pfilters());
  selectChoose('.t-automation-pf-select:eq(1)', PFD.keyTwo);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
      assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
    });
  });
});

test('add an empty filter and do a PUT, and the empty filter isnt sent and is silently ignored', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(store.find('automation', AD.idOne).get('pf').get('length'), 1);
  });
  page.addFilter();
  andThen(() => {
    assert.equal(store.find('automation', AD.idOne).get('pf').get('length'), 2);
  });
  let payload = AF.put({
    filters: [{
      id: PFD.idOne,
      source: PFD.sourceIdOne,
      criteria: [TD.priorityOneId],
      lookups: {}
    }]
  });
  clearxhr(listXhr);
  // xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  // generalPage.save();
  // andThen(() => {
  //   assert.equal(store.find('automation', AD.idOne).get('pf').get('length'), 1);
  //   assert.equal(currentURL(), AUTOMATION_LIST_URL);
  // });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  page.visitDetail();
  page.descriptionFill(AD.descriptionTwo);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), AUTOMATION_LIST_URL);
      var automation = store.find('automation', AD.idOne);
      assert.equal(automation.get('description'), AD.descriptionOne);
    });
  });
});

test('when click delete, modal displays and when click ok, automation is deleted and removed from store', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'automation'}));
      assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
    });
  });
  xhr(`${AUTOMATION_URL}${AD.idOne}/`, 'DELETE', null, {}, 204, {});
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), AUTOMATION_LIST_URL);
      assert.equal(store.find('automation', AD.idOne).get('length'), undefined);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when click delete, and click no modal disappears', assert => {
  clearxhr(listXhr);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'automation'}));
      assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
    });
  });
  generalPage.clickModalCancelDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

// PF m2m relationship

test('changing from one dynamic location available filter to another changes the location_level query param', assert => {
  clearxhr(listXhr);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  // 1st filter
  xhr(`${AUTOMATION_AVAILABLE_FILTERS_URL}`, 'GET', null, {}, 200, AF.list_pfilters());
  selectChoose('.t-automation-pf-select:eq(0)', PFD.keyTwo);
  let keyword = 'a';
  xhr(`/api/admin/locations/location__icontains=${keyword}/?location_level=${PFD.lookupsDynamic.id}`, 'GET', null, {}, 200, LF.search_power_select());
  selectSearch('.t-ticket-location-select', keyword);
  selectChoose('.t-ticket-location-select', LD.storeNameFour);
  andThen(() => {
    assert.equal(page.locationSelectedOne.split(/\s+/)[1], LD.storeNameFour);
  });
  // 2nd filter
  selectChoose('.t-automation-pf-select:eq(0)', PFD.keyThree);
  keyword = 'b';
  // main thing we're testing is this 'xhr' mock, that the location_level query param changed
  xhr(`/api/admin/locations/location__icontains=${keyword}/?location_level=${PFD.lookupsDynamicTwo.id}`, 'GET', null, {}, 200, LF.search_power_select());
  selectSearch('.t-ticket-location-select', keyword);
  selectChoose('.t-ticket-location-select', LD.storeNameFour);
  andThen(() => {
    assert.equal(page.locationSelectedOne.split(/\s+/)[1], LD.storeNameFour);
  });
});

// TODO; may need to come back and refacotr test
test('remove filter and save - should stay on page because an automation must have at least one filter and criteria unless auto-assign', assert => {
  clearxhr(listXhr);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal($('[data-test-id="validation-pf0"]').length, 0);
  });
  // criteria is required (unless auto-assign)
  page.filterOnePriorityOneRemove();
  andThen(() => {
    assert.equal(find('.t-save-btn').attr('disabled'), 'disabled');
  });
  selectChoose('.t-priority-criteria', TD.priorityTwo);
  andThen(() => {
    assert.equal(find('.t-save-btn').attr('disabled'), undefined);
  });
});

test('add filter, add criteria, remove filter, cancel', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  xhr(`${AUTOMATION_AVAILABLE_FILTERS_URL}`, 'GET', null, {}, 200, AF.list_pfilters());
  page.addFilter();
  selectChoose('.t-automation-pf-select:eq(1)', PFD.keyTwo);
  const keyword = 'a';
  xhr(`/api/admin/locations/location__icontains=${keyword}/?location_level=${PFD.lookupsDynamic.id}`, 'GET', null, {}, 200, LF.search_power_select());
  selectSearch('.t-ticket-location-select', keyword);
  selectChoose('.t-ticket-location-select', LD.storeNameFour);
  andThen(() => {
    assert.equal(page.locationSelectedOne.split(/\s+/)[1], LD.storeNameFour);
    assert.equal(find('.t-del-pf-btn').length, 2);
  });
  page.deleteFilterTwo();
  andThen(() => {
    assert.equal(find('.t-del-pf-btn').length, 1);
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], t(TD.priorityOneKey));
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
});

test('select category filter and update automation', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-automation-pf-select .ember-power-select-selected-item').text().trim(), t(PFD.keyOne));
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], t(TD.priorityOneKey));
  });
  xhr(`${AUTOMATION_AVAILABLE_FILTERS_URL}`, 'GET', null, {}, 200, AF.list_pfilters());
  selectChoose('.t-automation-pf-select:eq(0)', PFD.categoryKeyTranslated);
  andThen(() => {
    assert.equal(find('.t-ticket-category-select .ember-power-select-trigger-multiple-input').get(0)['placeholder'], t('admin.placeholder.category_filter_select'));
  });
  const keyword = 'a';
  const response = CF.list_power_select_id_name();
  const firstItemId = response.results[0]['id'];
  const firstItemName = response.results[0]['name'];
  xhr(`/api/admin/categories/automation-criteria/${keyword}/`, 'GET', null, {}, 200, response);
  selectSearch('.t-ticket-category-select', keyword);
  selectChoose('.t-ticket-category-select', firstItemName);
  andThen(() => {
    assert.equal(page.categorySelectedOne.split(/\s+/)[1], firstItemName);
  });
  let payload = AF.put({
    description: AD.descriptionOne,
    filters: [{
      id: PFD.idOne,
      source: PFD.sourceIdFour,
      criteria: [firstItemId],
      lookups: {}
    }]
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
});

test('select state filter and update automation', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-automation-pf-select .ember-power-select-selected-item').text().trim(), t(PFD.keyOne));
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], t(TD.priorityOneKey));
  });
  xhr(`${AUTOMATION_AVAILABLE_FILTERS_URL}`, 'GET', null, {}, 200, AF.list_pfilters());
  selectChoose('.t-automation-pf-select:eq(0)', PFD.stateKeyTranslated);
  andThen(() => {
    assert.equal(find('.t-ticket-state-select .ember-power-select-trigger-multiple-input:eq(0)').get(0)['placeholder'], t('admin.placeholder.state_filter_select'));
  });
  const keyword = 'a';
  const response = SF.list_power_select();
  const firstItemId = response.results[0]['id'];
  const firstItemName = response.results[0]['name'];
  xhr(`/api/states/tenant/?search=${keyword}`, 'GET', null, {}, 200, response);
  selectSearch('.t-ticket-state-select', keyword);
  selectChoose('.t-ticket-state-select', firstItemName);
  andThen(() => {
    assert.equal(page.stateSelectedOne.split(/\s+/)[1], firstItemName);
  });
  let payload = AF.put({
    description: AD.descriptionOne,
    filters: [{
      id: PFD.idOne,
      source: PFD.sourceIdFive,
      criteria: [firstItemId],
      lookups: {}
    }]
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
});

test('select country filter and update automation', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-automation-pf-select .ember-power-select-selected-item').text().trim(), t(PFD.keyOne));
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], t(TD.priorityOneKey));
  });
  xhr(`${AUTOMATION_AVAILABLE_FILTERS_URL}`, 'GET', null, {}, 200, AF.list_pfilters());
  selectChoose('.t-automation-pf-select:eq(0)', PFD.countryKeyTranslated);
  andThen(() => {
    assert.equal(find('.t-ticket-country-select .ember-power-select-trigger-multiple-input:eq(0)').get(0)['placeholder'], t('admin.placeholder.country_filter_select'));
  });
  const keyword = 'a';
  const response = CountryF.list_power_select();
  const firstItemId = response.results[0]['id'];
  const firstItemName = response.results[0]['name'];
  xhr(`/api/countries/tenant/?search=${keyword}`, 'GET', null, {}, 200, response);
  selectSearch('.t-ticket-country-select', keyword);
  selectChoose('.t-ticket-country-select', firstItemName);
  andThen(() => {
    assert.equal(page.countrySelectedOne.split(/\s+/)[1], firstItemName);
  });
  let payload = AF.put({
    description: AD.descriptionOne,
    filters: [{
      id: PFD.idOne,
      source: PFD.sourceIdSix,
      criteria: [firstItemId],
      lookups: {}
    }]
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
});

// Action m2m relationship

test('add and delete an action', assert => {
  // the 'assignee-select' is the first dynamic power-select on the page
  // and should only be cleared out of the final delete click, that will
  // insted of removing the last 'action' widget, clears int
  clearxhr(listXhr);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(Ember.$('.t-automation-action-type-select').length, 1);
    assert.equal(Ember.$('.t-automation-action-assignee-select').length, 1);
    assert.equal(page.actionTypeSelectedOne, AATD.keyOneTrans);
  });
  page.clickAddActionBtn();
  andThen(() => {
    assert.equal(Ember.$('.t-automation-action-type-select').length, 2);
    assert.equal(Ember.$('.t-automation-action-assignee-select').length, 1);
  });
  page.clickDeleteActionBtnTwo();
  andThen(() => {
    assert.equal(Ember.$('.t-automation-action-type-select').length, 1);
    assert.equal(Ember.$('.t-automation-action-assignee-select').length, 1);
    assert.equal(page.actionTypeSelectedOne, AATD.keyOneTrans);
  });
  page.clickDeleteActionBtn();
  andThen(() => {
    assert.equal(Ember.$('.t-automation-action-type-select').length, 1);
    assert.equal(Ember.$('.t-automation-action-assignee-select').length, 0);
    assert.equal(page.actionTypeSelectedOne, t('power.select.select'));
  });
});


test('select ticket assginee filter and update automation', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-automation-pf-select .ember-power-select-selected-item').text().trim(), t(PFD.keyOne));
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], t(TD.priorityOneKey));
  });
  xhr(`${AUTOMATION_ACTION_TYPES_URL}`, 'GET', null, {}, 200, AF.list_action_types());
  selectChoose('.t-automation-action-type-select:eq(0)', AATD.keyOneTrans);
  andThen(() => {
    assert.equal(find('.t-automation-action-type-select .ember-power-select-selected-item:eq(0)').text().trim(), t(AATD.keyOneTrans));
  });
  let personData = PF.search_power_select();
  let personOneId = personData.results[0].id;
  let personOneFullname = personData.results[0].fullname;
  let keyword = 'a';
  // xhr(`${PEOPLE_URL}person__icontains=e/`, 'GET', null, {}, 200, PF.search_power_select());
  xhr(`${PEOPLE_URL}person__icontains=${keyword}/`, 'GET', null, {}, 200, personData);
  selectSearch('.t-automation-action-assignee-select', keyword);
  selectChoose('.t-automation-action-assignee-select', personOneFullname);
  andThen(() => {
    assert.equal(page.actionAssigneeSelectedOne, personOneFullname);
  });
  let payload = AF.put({
    actions: [{
      id: AAD.idOne,
      type: AATD.idOne,
      content: {
        assignee: personOneId
      }
    }],
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
});

test('visit detail and update an actions assignee', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    // action type
    assert.equal(page.actionTypeSelectedOne, AATD.keyOneTrans);
    // action content - assignee
    assert.equal(page.actionAssigneeSelectedOne, PD.fullname);
  });
  // change assignee
  let personData = PF.search_power_select();
  let personOneId = personData.results[0].id;
  let personOneFullname = personData.results[0].fullname;
  let keyword = 'a';
  xhr(`${PEOPLE_URL}person__icontains=${keyword}/`, 'GET', null, {}, 200, personData);
  selectSearch('.t-automation-action-assignee-select', keyword);
  selectChoose('.t-automation-action-assignee-select', personOneFullname);
  andThen(() => {
    assert.equal(page.actionAssigneeSelectedOne, personOneFullname);
  });
  let payload = AF.put({
    description: AD.descriptionOne,
    events: [ED.idOne],
    actions: [{
      id: AAD.idOne,
      type: AATD.idOne,
      content: {
        assignee: personOneId
      }
    }],
    filters: [{
      id: PFD.idOne,
      source: PFD.sourceIdOne,
      lookups: {},
      criteria: [TD.priorityOneId]
    }]
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
});

test('get an action priority and update it to a new priority', assert => {
  clearxhr(detailXhr);
  const json = AF.detail();
  json.actions[0]['type'] = { id: AATD.idTwo, key: AATD.keyTwo };
  json.actions[0]['priority'] = { id: TPD.idOne, name: TPD.keyOne };
  xhr(API_DETAIL_URL, 'GET', null, {}, 200, json);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    // // action type
    assert.equal(page.actionTypeSelectedOne, AATD.keyTwoTrans);
    // action content - priority
    assert.equal(page.actionPrioritySelectedOne, TPD.priorityOne);
  });
  selectChoose('.t-ticket-priority-select', TPD.priorityTwo);
  andThen(() => {
    assert.equal(page.actionPrioritySelectedOne, TPD.priorityTwo);
  });
  let payload = AF.put({
    actions: [{
      id: AAD.idOne,
      type: AATD.idTwo,
      content: {
        priority: TPD.idTwo,
      }
    }]
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
});

test('select priority filter and update automation', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-automation-pf-select .ember-power-select-selected-item').text().trim(), t(PFD.keyOne));
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], t(TD.priorityOneKey));
  });
  xhr(`${AUTOMATION_ACTION_TYPES_URL}`, 'GET', null, {}, 200, AF.list_action_types());
  selectChoose('.t-automation-action-type-select:eq(0)', AATD.keyTwoTrans);
  andThen(() => {
    assert.equal(find('.t-automation-action-type-select .ember-power-select-selected-item:eq(0)').text().trim(), t(AATD.keyTwoTrans));
  });
  selectChoose('.t-ticket-priority-select', TPD.priorityTwo);
  andThen(() => {
    assert.equal(page.actionPrioritySelectedOne, TPD.priorityTwo);
  });
  let payload = AF.put({
    actions: [{
      id: AAD.idOne,
      type: AATD.idTwo,
      content: {
        priority: TPD.idTwo,
      }
    }]
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
  // });
});

test('get an action status and update it to a new status', assert => {
  clearxhr(detailXhr);
  const json = AF.detail();
  json.actions[0]['type'] = { id: AATD.idThree, key: AATD.keyThree };
  json.actions[0]['status'] = { id: TSD.idOne, name: TSD.keyOne };
  xhr(API_DETAIL_URL, 'GET', null, {}, 200, json);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.actionTypeSelectedOne, AATD.keyThreeTrans);
    assert.equal(page.actionStatusSelectedOne, TSD.keyOneValue);
  });
  selectChoose('.t-ticket-status-select', TSD.keyTwoValue);
  andThen(() => {
    assert.equal(page.actionStatusSelectedOne, TSD.keyTwoValue);
  });
  let payload = AF.put({
    actions: [{
      id: AAD.idOne,
      type: AATD.idThree,
      content: {
        status: TSD.idTwo,
      }
    }]
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
});

test('select status filter and update automation', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-automation-pf-select .ember-power-select-selected-item').text().trim(), t(PFD.keyOne));
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], t(TD.priorityOneKey));
  });
  xhr(`${AUTOMATION_ACTION_TYPES_URL}`, 'GET', null, {}, 200, AF.list_action_types());
  selectChoose('.t-automation-action-type-select:eq(0)', AATD.keyThreeTrans);
  andThen(() => {
    assert.equal(find('.t-automation-action-type-select .ember-power-select-selected-item:eq(0)').text().trim(), t(AATD.keyThreeTrans));
  });
  selectChoose('.t-ticket-status-select', TSD.keyTwoValue);
  andThen(() => {
    assert.equal(page.actionStatusSelectedOne, TSD.keyTwoValue);
  });
  let payload = AF.put({
    actions: [{
      id: AAD.idOne,
      type: AATD.idThree,
      content: {
        status: TSD.idTwo,
      }
    }]
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
});

test('get an action sendemail and update it to a new sendemail', assert => {
  clearxhr(detailXhr);
  const json = AF.detail();
  json.actions[0]['type'] = { id: AATD.idFour, key: AATD.keyFour };
  json.actions[0]['subject'] = SED.subjectOne;
  json.actions[0]['body'] = SED.bodyOne;
  json.actions[0]['recipients'] = [{id: PD.idOne, fullname: PD.fullname, type: 'person'}];
  xhr(API_DETAIL_URL, 'GET', null, {}, 200, json);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.actionTypeSelectedOne, AATD.keyFourTrans);
    assert.equal(page.actionSendEmailRecipientOne.replace(/\W/, '').trim(), PD.fullname);
    assert.equal(page.sendEmailBodyValue, SED.bodyOne);
    assert.equal(page.sendEmailSubjectValue, SED.subjectOne);
  });
  page.sendEmailBodyFillIn(SED.bodyTwo);
  page.sendEmailSubjectFillIn(SED.subjectTwo);
  xhr(`${PEOPLE_URL}email-recipients/?search=e`, 'GET', null, {}, 200, PF.sms_power_select());
  selectSearch('.t-action-recipient-select', 'e');
  selectChoose('.t-action-recipient-select', PD.fullnameBoy2);
  andThen(() => {
    assert.equal(page.sendEmailBodyValue, SED.bodyTwo);
    assert.equal(page.sendEmailSubjectValue, SED.subjectTwo);
    assert.equal(page.actionSendEmailRecipientTwo.replace(/\W/, '').trim(), PD.fullnameBoy2);
  });
  let payload = AF.put({
    actions: [{
      id: AAD.idOne,
      type: AATD.idFour,
      content: {
        body: SED.bodyTwo,
        subject: SED.subjectTwo,
        recipients: [{id: PD.idOne, type: 'person'}, {id: PD.idSearch, type: 'person'}]
      }
    }]
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
});

test('select send email filter and update automation', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-automation-pf-select .ember-power-select-selected-item').text().trim(), t(PFD.keyOne));
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], t(TD.priorityOneKey));
  });
  xhr(`${AUTOMATION_ACTION_TYPES_URL}`, 'GET', null, {}, 200, AF.list_action_types());
  selectChoose('.t-automation-action-type-select:eq(0)', AATD.keyFourTrans);
  andThen(() => {
    assert.equal(find('.t-automation-action-type-select .ember-power-select-selected-item:eq(0)').text().trim(), t(AATD.keyFourTrans));
  });
  page.sendEmailBodyFillIn(SED.bodyTwo);
  page.sendEmailSubjectFillIn(SED.subjectTwo);
  xhr(`${PEOPLE_URL}email-recipients/?search=e`, 'GET', null, {}, 200, PF.search_power_select());
  selectSearch('.t-action-recipient-select', 'e');
  selectChoose('.t-action-recipient-select', PD.fullnameBoy2);
  andThen(() => {
    assert.equal(page.sendEmailBodyValue, SED.bodyTwo);
    assert.equal(page.sendEmailSubjectValue, SED.subjectTwo);
    assert.equal(page.actionSendEmailRecipientOne.replace(/\W/, '').trim(), PD.fullnameBoy2);
  });
  clearxhr(listXhr);
  // let payload = AF.put({
  //   actions: [{
  //     id: AAD.idOne,
  //     type: AATD.idFour,
  //     content: {
  //       sendemail: {
  //         body: SED.bodyTwo,
  //         subject: SED.subjectTwo,
  //         recipients: [PD.idSearch]
  //       } 
  //     }
  //   }]
  // });
  // xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  // generalPage.save();
  // andThen(() => {
  //   assert.equal(currentURL(), AUTOMATION_LIST_URL);
  // });
});

test('select ticketcc filter and update automation', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-automation-pf-select .ember-power-select-selected-item').text().trim(), t(PFD.keyOne));
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], t(TD.priorityOneKey));
  });
  xhr(`${AUTOMATION_ACTION_TYPES_URL}`, 'GET', null, {}, 200, AF.list_action_types());
  selectChoose('.t-automation-action-type-select:eq(0)', AATD.keySevenTrans);
  andThen(() => {
    assert.equal(find('.t-automation-action-type-select .ember-power-select-selected-item:eq(0)').text().trim(), t(AATD.keySevenTrans));
  });
  xhr(`${PEOPLE_URL}person__icontains=e/`, 'GET', null, {}, 200, PF.search_power_select());
  selectSearch('.t-action-ticketcc-select', 'e');
  selectChoose('.t-action-ticketcc-select', PD.fullnameBoy2);
  andThen(() => {
    assert.equal(page.actionTicketccOne.replace(/\W/, '').trim(), PD.fullnameBoy2);
  });
  clearxhr(listXhr);
  // let payload = AF.put({
  //   actions: [{
  //     id: AAD.idOne,
  //     type: AATD.idFour,
  //     content: {
  //       sendemail: {
  //         body: SED.bodyTwo,
  //         subject: SED.subjectTwo,
  //         recipients: [PD.idSearch]
  //       } 
  //     }
  //   }]
  // });
  // xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  // generalPage.save();
  // andThen(() => {
  //   assert.equal(currentURL(), AUTOMATION_LIST_URL);
  // });
});

test('get an action sendsms and update it to a new sendsms', assert => {
  clearxhr(detailXhr);
  const json = AF.detail();
  json.actions[0]['type'] = { id: AATD.idFive, key: AATD.keyFive };
  json.actions[0]['body'] = SMSD.bodyOne;
  json.actions[0]['recipients'] = [{id: PD.idOne, fullname: PD.fullname}];
  xhr(API_DETAIL_URL, 'GET', null, {}, 200, json);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.actionTypeSelectedOne, AATD.keyFiveTrans, 'Type sendsms selected');
    assert.equal(page.actionSendSmsRecipientOne.replace(/\W/, '').trim(), PD.fullname, 'full name recipient shows');
    assert.equal(page.sendSmsBodyValue, SMSD.bodyOne, 'sendsms body shows');
  });
  page.sendSmsBodyFillIn(SMSD.bodyTwo);
  xhr(`${PEOPLE_URL}sms-recipients/?search=e`, 'GET', null, {}, 200, PF.sms_power_select());
  selectSearch('.t-action-recipient-select', 'e');
  selectChoose('.t-action-recipient-select', PD.fullnameBoy2);
  andThen(() => {
    assert.equal(page.sendSmsBodyValue, SMSD.bodyTwo, 'body is updated');
    assert.equal(page.actionSendSmsRecipientTwo.replace(/\W/, '').trim(), PD.fullnameBoy2, 'new recipient shows');
  });
  clearxhr(listXhr);
  // let payload = AF.put({
  //   actions: [{
  //     id: AAD.idOne,
  //     type: AATD.idFive,
  //     content: {
  //       sendsms: { 
  //         body: SMSD.bodyTwo,
  //         recipients: [PD.id, PD.idSearch]
  //       } 
  //     }
  //   }]
  // });
  // xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  // generalPage.save();
  // andThen(() => {
  //   assert.equal(currentURL(), AUTOMATION_LIST_URL);
  // });
});

test('select sendsms filter and update automation', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL, 'at detail url');
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], t(TD.priorityOneKey), 'priority initially selected');
  });
  xhr(`${AUTOMATION_ACTION_TYPES_URL}`, 'GET', null, {}, 200, AF.list_action_types());
  selectChoose('.t-automation-action-type-select:eq(0)', AATD.keyFiveTrans);
  andThen(() => {
    // Failing Jenkins
    // assert.equal(find('.t-automation-action-type-select .ember-power-select-selected-item:eq(0)').text().trim(), t(AATD.keyFive), 'selected type');
  });
  page.sendSmsBodyFillIn(SMSD.bodyTwo);
  xhr(`${PEOPLE_URL}sms-recipients/?search=e`, 'GET', null, {}, 200, PF.sms_power_select());
  selectSearch('.t-action-recipient-select', 'e');
  selectChoose('.t-action-recipient-select', PD.fullnameBoy2);
  andThen(() => {
    assert.equal(page.sendSmsBodyValue, SMSD.bodyTwo, 'sms body');
    assert.equal(page.actionSendSmsRecipientOne.replace(/\W/, '').trim(), PD.fullnameBoy2, 'recipient selected for sendsms');
  });
  clearxhr(listXhr);
  // let payload = AF.put({
  //   actions: [{
  //     id: AAD.idOne,
  //     type: AATD.idFive,
  //     content: {
  //       sendsms: { 
  //         body: SMSD.bodyTwo,
  //         recipients: [PD.idSearch]
  //       } 
  //     }
  //   }]
  // });
  // xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  // generalPage.save();
  // andThen(() => {
  //   assert.equal(currentURL(), AUTOMATION_LIST_URL, 'at list url');
  // });
});

// Ticket request
test('get an action ticket request and update it to a new ticket request', assert => {
  clearxhr(detailXhr);
  const json = AF.detail();
  json.actions[0]['type'] = { id: AATD.idSix, key: AATD.keySix };
  delete json.actions[0]['assignee'];
  json.actions[0]['request'] = AAD.requestOne;
  xhr(API_DETAIL_URL, 'GET', null, {}, 200, json);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.actionTypeSelectedOne, AATD.keySixTrans, 'type selected');
    assert.equal(page.ticketRequestValue, AAD.requestOne, 'exisiting request');
  });
  page.ticketRequestFillIn(AAD.requestOne);
  andThen(() => {
    assert.equal(page.ticketRequestValue, AAD.requestOne, 'filled in request');
  });
  clearxhr(listXhr);
  // let payload = AF.put({
  //   actions: [{
  //     id: AAD.idOne,
  //     type: AATD.idSix,
  //     content: {
  //       request: AAD.requestOne
  //     }
  //   }]
  // });
  // xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  // generalPage.save();
  // andThen(() => {
  //   assert.equal(currentURL(), AUTOMATION_LIST_URL, 'list url');
  // });
});

test('select ticket request filter and update automation', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.actionTypeSelectedOne, AATD.keyOneTrans);
  });
  xhr(`${AUTOMATION_ACTION_TYPES_URL}`, 'GET', null, {}, 200, AF.list_action_types());
  selectChoose('.t-automation-action-type-select:eq(0)', AATD.keySixTrans);
  andThen(() => {
    assert.equal(find('.t-automation-action-type-select .ember-power-select-selected-item:eq(0)').text().trim(), t(AATD.keySixTrans));
  });
  page.ticketRequestFillIn(AAD.requestTwo);
  andThen(() => {
    assert.equal(page.ticketRequestValue, AAD.requestTwo);
  });
  clearxhr(listXhr);
  // let payload = AF.put({
  //   actions: [{
  //     id: AAD.idOne,
  //     type: AATD.idSix,
  //     content: {
  //       request: AAD.requestTwo
  //     }
  //   }]
  // });
  // xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  // generalPage.save();
  // andThen(() => {
  //   assert.equal(currentURL(), AUTOMATION_LIST_URL);
  // });
});
