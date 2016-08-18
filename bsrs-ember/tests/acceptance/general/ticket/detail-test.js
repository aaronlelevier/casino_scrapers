import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import {ticket_payload, ticket_payload_with_comment, ticket_payload_detail_with_assignee, ticket_payload_detail, ticket_payload_detail_one_category} from 'bsrs-ember/tests/helpers/payloads/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
import PEOPLE_CURRENT_DEFAULTS from 'bsrs-ember/vendor/defaults/person-current';
import PF from 'bsrs-ember/vendor/people_fixtures';
import LF from 'bsrs-ember/vendor/location_fixtures';
import CD from 'bsrs-ember/vendor/defaults/category';
import CCD from 'bsrs-ember/vendor/defaults/category-children';
import CF from 'bsrs-ember/vendor/category_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import DTF from 'bsrs-ember/vendor/dtd_fixtures';
import DT from 'bsrs-ember/vendor/defaults/dtd';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/tickets';
import generalPage from 'bsrs-ember/tests/pages/general';
import dtdPage from 'bsrs-ember/tests/pages/dtd';
// import timemachine from 'vendor/timemachine';
import moment from 'moment';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { TICKETS_URL, LOCATIONS_URL, PEOPLE_URL, CATEGORIES_URL, DT_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const BASE_DT_URL = BASEURLS.base_dt_url;
const TICKET_URL = `${BASE_URL}/index`;
const DETAIL_URL = `${BASE_URL}/${TD.idOne}`;

const TICKET_PUT_URL = `${PREFIX}${DETAIL_URL}/`;
const LETTER_A = {keyCode: 65};
const LETTER_B = {keyCode: 66};
const LETTER_R = {keyCode: 82};
const LETTER_M = {keyCode: 77};
const LETTER_S = {keyCode: 83};
const NUMBER_6 = {keyCode: 54};
const SPACEBAR = {keyCode: 32};
const BACKSPACE = {keyCode: 8};
const LOCATION = '.t-ticket-location-select .ember-basic-dropdown-trigger';
const DROPDOWN = options;
const ASSIGNEE = '.t-ticket-assignee-select .ember-basic-dropdown-trigger';
const CC = '.t-ticket-cc-select .ember-basic-dropdown-trigger';
const CC_SEARCH = '.ember-power-select-trigger-multiple-input';
const SEARCH = '.ember-power-select-search input';
const categories = '.categories-power-select-search input';

let store, list_xhr, detail_xhr, top_level_xhr, detail_data, activity_one;

moduleForAcceptance('Acceptance | ticket detail', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    detail_data = TF.detail(TD.idOne);
    list_xhr = xhr(`${TICKETS_URL}?page=1`, 'GET', null, {}, 200, TF.list());
    detail_xhr = xhr(`${TICKETS_URL}${TD.idOne}/`, 'GET', null, {}, 200, detail_data);
    activity_one = xhr(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
    // timemachine.config({
    //   dateString: 'December 25, 2015 13:12:59'
    // });
  },
});

/* jshint ignore:start */

test('clicking a tickets will redirect to the given detail view and can save to ensure validation mixins are working (completed ticket)', async assert => {
  await page.visit();
  assert.equal(currentURL(), TICKET_URL);
  await click('.t-grid-data:eq(0)');
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(find('.t-dt-continue').text(), '');
  assert.equal(page.ccSelected.indexOf(PD.first_name), 2);
  assert.equal(find('.t-ticket-header').text().trim().split('  ')[0].trim(), 'Toilet Leak');
  let response = TF.detail(TD.idOne);
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_detail), {}, 200, response);
  await generalPage.save();
  assert.equal(currentURL(), TICKET_URL);
});

test('you can add a comment and post it while not updating created property', async assert => {
  let iso;
  clearxhr(list_xhr);
  await page.visitDetail();
  const date = new Date();
  date.setMonth(date.getMonth()-1);
  iso = date.toISOString();
  run(() => {
    store.push('ticket', {id: TD.idOne, created: iso});
  })
  assert.equal(find('.t-ticket-comment').attr('placeholder'), 'Enter a comment');
  page.commentFillIn(TD.commentOne);
  var ticket = store.find('ticket', TD.idOne);
  assert.equal(ticket.get('created'), iso);
  let response = TF.detail(TD.idOne);
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_with_comment), {}, 200, response);
  xhr(TICKETS_URL + '?page=1', 'GET', null, {}, 200, TF.list());
  await generalPage.save();
  assert.equal(currentURL(), TICKET_URL);
  ticket = store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('comment'), '');
  assert.equal(ticket.get('created'), iso);
});

test('when you deep link to the ticket detail view you get bound attrs', async assert => {
  clearxhr(list_xhr);
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  var ticket = store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(page.priorityInput, TD.priorityOne);
  assert.equal(page.statusInput, TD.statusOne);
  assert.equal(find('.t-created-comment > span').text(), `${PD.nameMel} created this ticket a few seconds ago`);
  page.priorityClickDropdown();
  page.priorityClickOptionTwo();
  page.statusClickDropdown();
  page.statusClickOptionTwo();
  const TOP_LEVEL_CATEGORIES_TICKET_URL = `${CATEGORIES_URL}parents/`;
  top_level_xhr = xhr(TOP_LEVEL_CATEGORIES_TICKET_URL, 'GET', null, {}, 200, CF.top_level());
  await page.categoryOneClickDropdown();
  await page.categoryOneClickOptionTwo();
  ticket = store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  assert.equal(page.priorityInput, TD.priorityTwo);
  assert.equal(page.statusInput, TD.statusTwo);
  page.requestFillIn(TD.requestOneGrid);
  let response = TF.detail(TD.idOne);
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_detail_one_category), {}, 200, response);
  xhr(TICKETS_URL + '?page=1', 'GET', null, {}, 200, TF.list());
  await generalPage.save();
  assert.equal(currentURL(), TICKET_URL);
  ticket = store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirty'));
});

test('when you click cancel, you are redirected to the ticket list view', async assert => {
  await page.visitDetail();
  await generalPage.cancel();
  assert.equal(currentURL(), TICKET_URL);
});

test('validation works for assignee if ticket status is not draft', async assert => {
  clearxhr(list_xhr);
  detail_data.assignee = null;
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  assert.ok(page.assigneeErrorHidden);
  await generalPage.save();
  assert.ok(page.assigneeErrorVisible);
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(page.assigneeErrorText, t('error.ticket.assignee'));
  xhr(`${PEOPLE_URL}person__icontains=Boy1/`, 'GET', null, {}, 200, PF.search_power_select());
  await page.assigneeClickDropdown();
  fillIn(`${SEARCH}`, 'Boy1');
  await page.assigneeClickOptionOne();
  assert.ok(page.assigneeErrorHidden);
  assert.equal(currentURL(), DETAIL_URL);
  const ticket = store.find('ticket', TD.idOne);
  assert.equal(ticket.get('assignee_fk'), undefined);
  assert.equal(ticket.get('assignee.id'), PD.idBoy);
});

test('validation does not show if ticket status is draft', async assert => {
  clearxhr(list_xhr);
  detail_data.assignee = null;
  detail_data.status_fk = TD.statusSevenId;
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  assert.ok(page.assigneeErrorHidden);
  const mod_ticket_payload = Ember.$.extend(true, {}, ticket_payload_detail)
  mod_ticket_payload.status = TD.statusSevenId;
  mod_ticket_payload.assignee = undefined;
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(mod_ticket_payload), {}, 200, {});
  xhr(TICKETS_URL + '?page=1', 'GET', null, {}, 200, TF.list());
  await generalPage.save();
  assert.equal(currentURL(), TICKET_URL);
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', async assert => {
  clearxhr(list_xhr);
  await page.visitDetail();
  page.priorityClickDropdown();
  page.priorityClickOptionTwo();
  await generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(page.priorityInput, TD.priorityTwo);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when click delete, modal displays and when click ok, ticket is deleted and removed from store', assert => {
  page.visitDetail();
  generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'ticket'}));
      assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
    });
  });
  xhr(`${TICKETS_URL}${TD.idOne}/`, 'DELETE', null, {}, 204, {});
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), TICKET_URL);
      assert.equal(store.find('ticket', TD.idOne).get('length'), undefined);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when click delete, and click no modal disappears', async assert => {
  clearxhr(list_xhr);
  await page.visitDetail();
  await generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(store.find('ticket').get('length'), 1);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'ticket'}));
      assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
    });
  });
  generalPage.clickModalCancelDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(store.find('ticket').get('length'), 1);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('visiting detail should set the category even when it has no children', async assert => {
  clearxhr(list_xhr);
  clearxhr(detail_xhr);
  clearxhr(activity_one);
  ajax(`/api/tickets/${TD.idTwo}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
  let solo_data = TF.detail(TD.idTwo);
  solo_data.categories = [{id: CD.idSolo, name: CD.nameSolo, children: []}];
  ajax(TICKETS_URL + TD.idTwo + '/', 'GET', null, {}, 200, solo_data);
  await visit(BASE_URL + '/' + TD.idTwo);
  assert.equal(currentURL(), BASE_URL + '/' + TD.idTwo);
  let components = page.powerSelectComponents;
  assert.equal(components, 1);
  assert.equal(page.categoryOneInput, CD.nameSolo);
});

test('clicking cancel button will take from detail view to list view', async assert => {
  await page.visit();
  assert.equal(currentURL(), TICKET_URL);
  await click('.t-grid-data:eq(0)');
  assert.equal(currentURL(),DETAIL_URL);
  await generalPage.cancel();
  assert.equal(currentURL(), TICKET_URL);
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  page.visitDetail();
  page.priorityClickDropdown();
  page.priorityClickOptionTwo();
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), TICKET_URL);
    });
  });
});

//*TICKET CC M2M*/
test('clicking and typing into power select for people will fire off xhr request for all people', (assert) => {
  page.visitDetail();
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.first_name);
    assert.equal(page.ccSelected.indexOf(PD.first_name), 2);
  });
  let PEOPLE_TICKETS_URL = `${PEOPLE_URL}person__icontains=a/`;
  xhr(PEOPLE_TICKETS_URL, 'GET', null, {}, 200, PF.get_for_power_select(PD.idDonald, PD.donald_first_name, PD.donald_last_name));
  page.ccClickDropdown();
  fillIn(`${CC_SEARCH}`, 'a');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.ccSelected.indexOf(PD.first_name), 2);
    assert.equal(page.ccOptionLength, 1);
    // assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), PD.donald);
  });
  page.ccClickDonald();
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 2);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
    assert.equal(ticket.get('cc').objectAt(1).get('first_name'), PD.first_name);
    assert.equal(page.ccSelected.indexOf(PD.donald), 2);
    assert.equal(page.ccTwoSelected.indexOf(PD.first_name), 2);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  page.ccClickDropdown();
  fillIn(`${CC_SEARCH}`, '');
  andThen(() => {
    assert.equal(page.ccOptionLength, 1);
    assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
  });
  fillIn(`${CC_SEARCH}`, 'a');
  andThen(() => {
    assert.equal(page.ccSelected.indexOf(PD.donald), 2);
    assert.equal(page.ccTwoSelected.indexOf(PD.first_name), 2);
    assert.equal(page.ccOptionLength, 1);
    assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), PD.donald);
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 2);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
    assert.equal(ticket.get('cc').objectAt(1).get('first_name'), PD.first_name);
  });
  //search specific cc
  page.ccClickDropdown();
  xhr(`${PEOPLE_URL}person__icontains=Boy/`, 'GET', null, {}, 200, PF.search_power_select());
  fillIn(`${CC_SEARCH}`, 'Boy');
  andThen(() => {
    assert.equal(page.ccSelected.indexOf(PD.donald), 2);
    assert.equal(page.ccTwoSelected.indexOf(PD.first_name), 2);
    assert.equal(page.ccOptionLength, 10);
    assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 2);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
    assert.equal(ticket.get('cc').objectAt(1).get('first_name'), PD.first_name);
  });
  page.ccClickOptionOne();
  andThen(() => {
    assert.equal(page.ccSelected.indexOf(PD.donald), 2);
    assert.equal(page.ccTwoSelected.indexOf(PD.first_name), 2);
    assert.equal(page.ccThreeSelected.indexOf(PD.nameBoy), 2);
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
    assert.equal(ticket.get('cc').objectAt(1).get('first_name'), PD.first_name);
    assert.equal(ticket.get('cc').objectAt(2).get('id'), PD.idBoy);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  let response_put = TF.detail(TD.idOne);
  response_put.cc = {id: PD.idThree, name: PD.storeNameThree};
  const payload_two = TF.put({id: TD.idOne, cc: [PD.idDonald, PD.idOne, PD.idBoy]});
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload_two), {}, 200, response_put);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
  });
});

test('can remove and add back same cc and save empty cc', (assert) => {
  page.visitDetail();
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  });
  page.ccOneRemove();
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 0);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  let PEOPLE_TICKETS_URL = `${PEOPLE_URL}person__icontains=a/`;
  xhr(PEOPLE_TICKETS_URL, 'GET', null, {}, 200, PF.get_for_power_select(PD.idDonald, PD.donald_first_name, PD.donald_last_name));
  page.ccClickDropdown();//don't know why I have to do this
  fillIn(`${CC_SEARCH}`, 'a');
  andThen(() => {
    assert.equal(page.ccOptionLength, 1);
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('ticket_cc_fks').length, 1);
    assert.equal(ticket.get('cc').get('length'), 0);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  page.ccClickDonald();
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('ticket_cc_fks').length, 1);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  page.ccOneRemove();
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 0);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  xhr(`${PEOPLE_URL}person__icontains=Mel/`, 'GET', null, {}, 200, PF.get_for_power_select());
  page.ccClickDropdown();
  fillIn(`${CC_SEARCH}`, 'Mel');
  page.ccClickMel();
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  });
  payload = TF.put({id: TD.idOne, cc: [PD.idOne]});
  const response = Ember.$.extend(true, {}, payload);
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
  });
});

test('starting with multiple cc, can remove all ccs (while not populating options) and add back', (assert) => {
  detail_data.cc = [...detail_data.cc, PF.get(PD.idTwo)];
  detail_data.cc[1].first_name = PD.first_name + 'i';
  page.visitDetail();
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 2);
    assert.equal(ticket.get('ticket_cc_fks').length, 2);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(page.ccsSelected, 2);
  });
  page.ccTwoRemove();
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.equal(page.ccsSelected, 1);
  });
  page.ccOneRemove();
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 0);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.equal(page.ccsSelected, 0);
  });
  let PEOPLE_TICKETS_URL = `${PEOPLE_URL}person__icontains=Mel/`;
  ajax(PEOPLE_TICKETS_URL, 'GET', null, {}, 200, PF.get_for_power_select());
  page.ccClickDropdown();
  fillIn(CC_SEARCH, 'Mel');
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 0);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  page.ccClickMel();
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.equal(page.ccsSelected, 1);
  });
  let payload = TF.put({id: TD.idOne, cc: [PD.idOne]});
  ajax(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
  });
});

test('clicking and typing into db-multi power select for people will fire xhr if spacebar pressed', (assert) => {
  page.visitDetail();
  page.ccClickDropdown();
  fillIn(`${CC_SEARCH}`, ' ');
  andThen(() => {
    assert.equal(page.ccSelected.indexOf(PD.first_name), 2);
    assert.equal(page.ccOptionLength, 1);
    assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
  });
  let response = TF.detail(TD.idOne);
  let payload = TF.put({id: TD.idOne, cc: [PD.idOne]});
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
  });
});

/*TICKET CATEGORIES M2M*/
test('categories are in order based on text', (assert) => {
  clearxhr(list_xhr);
  page.visitDetail();
  andThen(() => {
    assert.equal(page.categoryOneInput, CD.nameOne);
    assert.equal(page.categoryTwoInput, CD.nameRepairChild);
    assert.equal(page.categoryThreeInput, CD.namePlumbingChild);
  });
});

test('power select options are rendered immediately when enter detail route and can save different top level category', (assert) => {
  let top_level_data = CF.top_level();
  top_level_data.results[1] = {id: CD.idThree, name: CD.nameThree, children: [{id: CD.idLossPreventionChild, name: CD.nameLossPreventionChild}], level: 0};
  page.visitDetail();
  andThen(() => {
    let components = page.powerSelectComponents;
    assert.equal(components, 3);
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('top_level_category').get('id'), CD.idOne);
    assert.equal(ticket.get('categories').get('length'), 3);
  });
  let TOP_LEVEL_CATEGORIES_TICKET_URL = `${CATEGORIES_URL}parents/`;
  xhr(TOP_LEVEL_CATEGORIES_TICKET_URL, 'GET', null, {}, 200, top_level_data);
  page.categoryOneClickDropdown();
  andThen(() => {
    assert.equal(page.categoryOneInput, CD.nameOne);
    assert.equal(page.categoryOneOptionLength, 2);
  });
  page.categoryOneClickDropdown();
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get(CD.idTwo, CD.nameTwo));
  page.categoryTwoClickDropdown();
  andThen(() => {
    assert.equal(page.categoryTwoInput, CD.nameRepairChild);
  });
  page.categoryTwoClickDropdown();
  ajax(`${CATEGORIES_URL}?parent=${CD.idPlumbing}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbing, CD.nameRepairChild));
  page.categoryThreeClickDropdown();
  andThen(() => {
    assert.equal(page.categoryThreeInput, CD.namePlumbingChild);
    assert.equal(page.categoryThreeOptionLength, 1);
  });
  page.categoryThreeClickDropdown();
  //click loss prevention
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionTwo();
  andThen(() => {
    let components = page.powerSelectComponents;
    assert.equal(components, 2);
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('top_level_category').get('id'), CD.idThree);
    assert.equal(ticket.get('model_categories_fks').length, 3);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  page.categoryOneClickDropdown();
  andThen(() => {
    assert.equal(page.categoryOneInput, CD.nameThree);
    assert.equal(page.categoryOneOptionLength, 2);
  });
  page.categoryOneClickDropdown();
  const security = CF.get_list(CD.idLossPreventionChild, CD.nameLossPreventionChild, [], CD.idThree, 1);
  ajax(`${CATEGORIES_URL}?parent=${CD.idThree}&page_size=1000`, 'GET', null, {}, 200, security);
  page.categoryTwoClickDropdown();
  andThen(() => {
    assert.equal(page.categoryTwoOptionLength, 1);
  });
  page.categoryTwoClickOptionSecurity();
  andThen(() => {
    assert.equal(page.categoryTwoInput, CD.nameLossPreventionChild);
  });
  const payload = TF.put({id: TD.idOne, categories: [CD.idThree, CD.idLossPreventionChild]});
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
  });
});

test('selecting a top level category will alter the url and can cancel/discard changes and return to index', (assert) => {
  page.visitDetail();
  andThen(() => {
    //override electrical to have children
    store.push('category-children', {id: CCD.idOne, category_pk: CD.idTwo, child_pk: CD.idChild});
    let cat = store.push('category', {id: CD.idTwo, name: CD.nameTwo, category_children_fks: [CCD.idOne], parent_id: CD.idOne, level: 1});
    cat.save();
    let components = page.powerSelectComponents;
    assert.equal(store.find('category').get('length'), 4);
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('categories').get('length'), 3);
    // assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    // assert.ok(ticket.get('categoriesIsNotDirty'));
    assert.equal(components, 3);
  });
  // select same
  let TOP_LEVEL_CATEGORIES_TICKET_URL = `${CATEGORIES_URL}parents/`;
  top_level_xhr = xhr(TOP_LEVEL_CATEGORIES_TICKET_URL, 'GET', null, {}, 200, CF.top_level());
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionOne();
  andThen(() => {
    let components = page.powerSelectComponents;
    assert.equal(store.find('ticket').get('length'), 1);
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('categories').get('length'), 3);
    assert.equal(ticket.get('sorted_categories').get('length'), 3);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('children').get('length'), 2);
    assert.equal(ticket.get('sorted_categories').objectAt(1).get('children').get('length'), 1);
    assert.equal(ticket.get('sorted_categories').objectAt(2).get('children').get('length'), 0);
    // assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    // assert.ok(ticket.get('categoriesIsNotDirty'));
    assert.equal(components, 3);
  });
  //select electrical from second level
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id:CD.idChild}], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionElectrical();
  andThen(() => {
    let components = page.powerSelectComponents;
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(store.find('category').get('length'), 5);
    assert.equal(ticket.get('categories').get('length'), 2);
    assert.equal(ticket.get('sorted_categories').get('length'), 2);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('children').get('length'), 2);
    // assert.equal(ticket.get('sorted_categories').objectAt(1).get('children').get('length'), 1);
    // assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    // assert.ok(ticket.get('categoriesIsDirty'));
    assert.equal(components, 3);
  });
  const payload = CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2);
  ajax(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, payload);
  page.categoryThreeClickDropdown();
  page.categoryThreeClickOptionOne();
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
      let components = page.powerSelectComponents;
      let tickets = store.find('ticket');
      assert.equal(store.find('category').get('length'), 5);
      assert.equal(tickets.get('length'), 1);
      let ticket = store.find('ticket', TD.idOne);
      assert.equal(ticket.get('categories').get('length'), 3);
      assert.equal(ticket.get('sorted_categories').objectAt(0).get('children').get('length'), 2);
      assert.equal(ticket.get('sorted_categories').objectAt(1).get('children').get('length'), 1);
      assert.equal(ticket.get('sorted_categories').objectAt(2).get('children').get('length'), 0);
      // assert.ok(ticket.get('isDirtyOrRelatedDirty'));
      // assert.ok(ticket.get('categoriesIsDirty'));
      assert.equal(components, 3);
    });
  });
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), TICKET_URL);
    });
  });
});

test('changing tree and reverting tree should not show as dirty', (assert) => {
  let TOP_LEVEL_CATEGORIES_TICKET_URL = `${CATEGORIES_URL}parents/`;
  top_level_xhr = xhr(TOP_LEVEL_CATEGORIES_TICKET_URL, 'GET', null, {}, 200, CF.top_level());
  clearxhr(list_xhr);
  page.visitDetail();
  andThen(() => {
    //override electrical to have children
    store.push('category-children', {id: CCD.idOne, category_pk: CD.idTwo, child_pk: CD.idChild});
    let cat = store.push('category', {id: CD.idTwo, name: CD.nameTwo, category_children_fks: [CCD.idOne], parent_id: CD.idOne, level: 1});
    cat.save();
    let ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(ticket.get('categoriesIsNotDirty'));
  });
  //select same
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionOne();
  andThen(() => {
    let components = page.powerSelectComponents;
    let ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(ticket.get('categoriesIsNotDirty'));
  });
  //select electrical from second level
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionElectrical();
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.ok(ticket.get('categoriesIsDirty'));
  });
  ajax(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
  page.categoryThreeClickDropdown();
  page.categoryThreeClickOptionOne();
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.ok(ticket.get('categoriesIsDirty'));
  });
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbing, CD.nameRepairChild, [{id:CD.idPlumbingChild}], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionPlumbing();
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.ok(ticket.get('categoriesIsDirty'));
  });
  ajax(`${CATEGORIES_URL}?parent=${CD.idPlumbing}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbingChild, CD.namePlumbingChild, [], CD.idPlumbing, 2));
  page.categoryThreeClickDropdown();
  //reset tree back to original
  page.categoryThreeClickOptionToilet();
  andThen(() => {
    let ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(ticket.get('categoriesIsNotDirty'));
  });
});

test('selecting and removing a top level category will remove children categories already selected', (assert) => {
  let TOP_LEVEL_CATEGORIES_TICKET_URL = `${CATEGORIES_URL}parents/`;
  top_level_xhr = xhr(TOP_LEVEL_CATEGORIES_TICKET_URL, 'GET', null, {}, 200, CF.top_level());
  clearxhr(list_xhr);
  page.visitDetail();
  andThen(() => {
    let components = page.powerSelectComponents;
    assert.equal(store.find('category').get('length'), 4);
    let tickets = store.find('ticket');
  });
  //change top level
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionTwo();
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = store.find('ticket');
    assert.equal(tickets.get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 0);
    assert.equal(components, 1);
  });
});

test('when selecting a new parent category it should remove previously selected child category but if select same, it wont clear tree', (assert) => {
  page.visitDetail();
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbing, CD.nameRepairChild, [{id: CD.idChild}], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionPlumbing();
  andThen(() => {
    let ticket = store.findOne('ticket');
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('categories').get('length'), 3);
    let components = page.powerSelectComponents;
    assert.equal(components, 3);
  });
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionElectrical();
  andThen(() => {
    let ticket = store.findOne('ticket');
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.equal(ticket.get('categories').get('length'), 2);
    let components = page.powerSelectComponents;
    assert.equal(components, 3);
  });
  let TOP_LEVEL_CATEGORIES_TICKET_URL = `${CATEGORIES_URL}parents/`;
  top_level_xhr = xhr(TOP_LEVEL_CATEGORIES_TICKET_URL, 'GET', null, {}, 200, CF.top_level());
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionTwo();
  andThen(() => {
    let ticket = store.findOne('ticket');
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.equal(ticket.get('categories').get('length'), 1);
    let components = page.powerSelectComponents;
    assert.equal(components, 1);
  });
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionOne();
  ajax(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionOne();
  page.categoryThreeClickDropdown();
  page.categoryThreeClickOptionOne();
  let payload = ticket_payload_detail;
  payload.categories = [CD.idOne, CD.idTwo , CD.idChild];
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
  });
});

/*TICKET TO LOCATION*/
test('location component shows location for ticket and will fire off xhr to fetch locations on search to change location', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(page.locationInput, LD.storeName);
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('location.id'), LD.idOne);
    assert.equal(ticket.get('location_fk'), LD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('top_level_category').get('id'), CD.idOne);
  });
  // <check category tree>
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbing, CD.nameRepairChild, [CD.idPlumbingChild], CD.idOne, 1));
  page.categoryOneClickDropdown();
  andThen(() => {
    assert.equal(page.categoryOneInput, CD.nameOne);
    assert.equal(page.categoryOneOptionLength, 2);
  });
  const TOP_LEVEL_CATEGORIES_TICKET_URL = `${CATEGORIES_URL}parents/`;
  top_level_xhr = xhr(TOP_LEVEL_CATEGORIES_TICKET_URL, 'GET', null, {}, 200, CF.top_level());
  page.categoryOneClickDropdown();
  page.categoryTwoClickDropdown();
  andThen(() => {
    assert.equal(page.categoryTwoInput, CD.nameRepairChild);
    // assert.equal(page.categoryTwoOptionLength, 1);//fetch data will change this to 2 once implemented
  });
  ajax(`${CATEGORIES_URL}?parent=${CD.idPlumbing}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbingChild, CD.namePlumbingChild, [], CD.idPlumbing, 2));
  page.categoryTwoClickDropdown();
  page.categoryThreeClickDropdown();
  andThen(() => {
    assert.equal(page.categoryThreeInput, CD.namePlumbingChild);
    assert.equal(page.categoryThreeOptionLength, 1);
  });
  // </check category tree>
  xhr(`${LOCATIONS_URL}location__icontains=6/`, 'GET', null, {}, 200, LF.search_power_select());
  page.categoryThreeClickDropdown();
  page.locationClickDropdown();
  fillIn(`${SEARCH}`, '6');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.locationInput, LD.storeName);
    assert.equal(page.locationOptionLength, 2);
    assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), LD.storeNameFour);
    assert.equal(find(`${DROPDOWN} > li:eq(1)`).text().trim(), LD.storeNameTwo);
  });
  page.locationClickOptionTwo();
  andThen(() => {
    assert.equal(page.locationInput, LD.storeNameTwo);
  });
  page.locationClickDropdown();
  fillIn(`${SEARCH}`, '');
  andThen(() => {
    assert.equal(page.locationOptionLength, 1);
    assert.equal(find(`${DROPDOWN}`).text().trim(), GLOBALMSG.power_search);
  });
  fillIn(`${SEARCH}`, '6');
  andThen(() => {
    assert.equal(page.locationInput, LD.storeNameTwo);
    assert.equal(page.locationOptionLength, 2);
    assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), LD.storeNameFour);
    assert.equal(find(`${DROPDOWN} > li:eq(1)`).text().trim(), LD.storeNameTwo);
  });
  page.locationClickOptionTwo();
  andThen(() => {
    assert.equal(page.locationInput, LD.storeNameTwo);
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('location.id'), LD.idTwo);
    assert.equal(ticket.get('location_fk'), LD.idOne);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    //ensure categories has not changed
    assert.equal(ticket.get('top_level_category').get('id'), CD.idOne);
    assert.equal(ticket.get('categories').get('length'), 3);
  });
  //search specific location
  xhr(`${LOCATIONS_URL}location__icontains=GHI789/`, 'GET', null, {}, 200, LF.search_idThree());
  page.locationClickDropdown();
  fillIn(`${SEARCH}`, 'GHI789');
  andThen(() => {
    assert.equal(page.locationInput, LD.storeNameTwo);
    assert.equal(page.locationOptionLength, 1);
    assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), LD.storeNameThree);
  });
  page.locationClickIdThree();
  andThen(() => {
    assert.equal(page.locationInput, LD.storeNameThree);
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('location.id'), LD.idThree);
    assert.equal(ticket.get('location_fk'), LD.idOne);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    //ensure categories has not changed
    assert.equal(ticket.get('top_level_category').get('id'), CD.idOne);
    assert.equal(ticket.get('categories').get('length'), 3);
  });
  let response_put = TF.detail(TD.idOne);
  response_put.location = {id: LD.idThree, name: LD.storeNameThree};
  let payload = TF.put({id: TD.idOne, location: LD.idThree});
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response_put);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
  });
});

//*TICKET TO ASSIGNEE*/
test('assignee component shows assignee for ticket and will fire off xhr to fetch assignees on search to change assignee', async assert => {
  await page.visitDetail();
  assert.equal(page.assigneeInput, PD.fullname);
  let ticket = store.find('ticket', TD.idOne);
  assert.equal(ticket.get('assignee.id'), PD.idOne);
  assert.equal(ticket.get('assignee_fk'), PD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  xhr(`${PEOPLE_URL}person__icontains=b/`, 'GET', null, {}, 200, PF.search_power_select());
  await page.assigneeClickDropdown();
  await fillIn(`${SEARCH}`, 'b');
  assert.equal(page.assigneeInput, PD.fullname);
  assert.equal(page.assigneeOptionLength, 10);
  assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
  await page.assigneeClickOptionOne();
  assert.equal(page.assigneeInput, `${PD.nameBoy} ${PD.lastNameBoy}`);
  await page.assigneeClickDropdown();
  await fillIn(`${SEARCH}`, '');
  assert.equal(page.assigneeOptionLength, 1);
  assert.equal(page.assigneeInput, `${PD.nameBoy} ${PD.lastNameBoy}`);
  await fillIn(`${SEARCH}`, 'b');
  assert.equal(page.assigneeInput, `${PD.nameBoy} ${PD.lastNameBoy}`);
  assert.equal(page.assigneeOptionLength, 10);
  assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
  await page.assigneeClickOptionTwo();
  assert.equal(page.assigneeInput, `${PD.nameBoy2} ${PD.lastNameBoy2}`);
  ticket = store.find('ticket', TD.idOne);
  assert.equal(ticket.get('assignee.id'), PD.idSearch);
  assert.equal(ticket.get('assignee_fk'), PD.idOne);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  //ensure categories has not changed
  assert.equal(ticket.get('top_level_category').get('id'), CD.idOne);
  assert.equal(ticket.get('categories').get('length'), 3);
  //search specific assignee
  xhr(`${PEOPLE_URL}person__icontains=Boy1/`, 'GET', null, {}, 200, PF.search_power_select());
  await page.assigneeClickDropdown();
  await fillIn(`${SEARCH}`, 'Boy1');
  assert.equal(page.assigneeInput, `${PD.nameBoy2} ${PD.lastNameBoy2}`);
  assert.equal(page.assigneeOptionLength, 10);
  assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
  await page.assigneeClickOptionOne();
  assert.equal(page.assigneeInput, `${PD.nameBoy} ${PD.lastNameBoy}`);
  ticket = store.find('ticket', TD.idOne);
  assert.equal(ticket.get('assignee.id'), PD.idBoy);
  assert.equal(ticket.get('assignee_fk'), PD.idOne);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  //ensure categories has not changed
  assert.equal(ticket.get('top_level_category').get('id'), CD.idOne);
  assert.equal(ticket.get('categories').get('length'), 3);
  let response_put = TF.detail(TD.idOne);
  response_put.assignee = {id: PD.idBoy, first_name: PD.nameBoy};
  let payload = TF.put({id: TD.idOne, assignee: PD.idBoy});
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response_put);
  await generalPage.save();
  assert.equal(currentURL(), TICKET_URL);
});

test('clicking and typing into db-fetch power select for people will not fire xhr if spacebar pressed', async assert => {
  clearxhr(list_xhr);
  await page.visitDetail();
  await page.assigneeClickDropdown();
  await fillIn(`${SEARCH}`, ' ');
  assert.equal(page.assigneeOptionLength, 1);
  assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
});

/* OTHER */
test('textarea autoresize working for the request field', async assert => {
  await page.visit();
  assert.equal(currentURL(), TICKET_URL);
  await click('.t-grid-data:eq(0)');
  assert.equal(currentURL(), DETAIL_URL);
  let o_height = find('.t-ticket-request').innerHeight();
  await fillIn(find('.t-ticket-request'), 'this\nthat\nthis\nthat\nthis\n');
  andThen(() => {
    waitFor(assert, () => {
      let n_height = find('.t-ticket-request').innerHeight();
      assert.ok(n_height > o_height);
    });
  });
});

test('making a ticket dirty causes the dirty indicator do show in the grid', async assert => {
  await page.visit();
  assert.equal(currentURL(), TICKET_URL);
  assert.equal(find('.t-grid-data:eq(0) .dirty').length, 0);
  await click('.t-grid-data:eq(0)');
  let ticket = store.find('ticket', TD.idOne);
  assert.equal(currentURL(), DETAIL_URL);
  fillIn(find('.t-ticket-request'), 'this\nthat\nthis\nthat\nthis\n');
  await page.visit();
  assert.equal(currentURL(), TICKET_URL);
  assert.equal(find('.t-grid-data:eq(0) .dirty').length, 1);
});

/* UPDATE BUTTON */
test('clicking update with no changes will not fire off xhr', async assert => {
  clearxhr(list_xhr);
  await page.visitDetail();
  await page.update();
  assert.equal(currentURL(), DETAIL_URL);
});

test('scott clicking update will not transition away from ticket detail and bring in latest activities in correct order', async assert => {
  let iso;
  clearxhr(list_xhr);
  await page.visitDetail();
  const date = new Date();
  date.setMonth(date.getMonth()-1);
  iso = date.toISOString();
  run(() => {
    store.push('ticket', {id: TD.idOne, created: iso});
  })
  assert.equal(find('.t-ticket-comment').attr('placeholder'), 'Enter a comment');
  page.commentFillIn(TD.commentOne);
  let response = TF.detail(TD.idOne);
  ajax(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_with_comment), {}, 200, response);
  let json = TA_FIXTURES.assignee_only();
  //Prevent setting read only properties
  const d = new Date();
  json.results[1].created = d.setDate(d.getDate()-90);
  json.results[1].person.fullname = 'Im second';

  const activity_response = json;
  ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, activity_response);
  await page.update();
  assert.equal(currentURL(), DETAIL_URL);
  let ticket = store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('comment'), '');
  assert.equal(ticket.get('created'), iso);
  assert.equal(page.activityTwoPerson, 'Im second');
  let activity = store.find('activity');
  assert.equal(activity.get('length'), 2);
});

test('deep linking with an xhr with a 404 status code will show up in the error component (ticket)', async assert => {
  clearxhr(detail_xhr);
  clearxhr(list_xhr);
  const exception = `This record does not exist.`;
  xhr(`${TICKETS_URL}${TD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(find('.t-error-message').text(), 'WAT');
});

test('dt continue button will show up if ticket has a status of draft and can click on it to restart dt', async assert => {
  clearxhr(list_xhr);
  clearxhr(detail_xhr);
  detail_data = TF.detail(TD.idOne, TD.statusSevenId);
  detail_xhr = xhr(`${TICKETS_URL}${TD.idOne}/`, 'GET', null, {}, 200, detail_data);
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(find('.t-dt-continue').text(), t('ticket.continue'));
  const dt_data = DTF.detailWithAllFields(DT.idOne);
  const returned_ticket = TF.detail(TD.idOne);
  const dt_TICKETS_URL = `${DT_URL}${DT.idTwo}/ticket/?ticket=${TD.idOne}`;
  xhr(dt_TICKETS_URL, 'GET', null, {}, 200, {dtd: dt_data, ticket: returned_ticket});
  await page.continueDT();
  assert.ok(dtdPage.previewActionButton);
  assert.equal(dtdPage.breadcrumbText, `${substringBreadcrumb(DT.descriptionOne)} ${substringBreadcrumb(DT.descriptionTwo)}`);
  const ticket = store.find('ticket', TD.idOne);
  assert.notOk(ticket.get('hasSaved'));//prevents PATCH when bail on existing dtd
});

/* jshint ignore:end */
