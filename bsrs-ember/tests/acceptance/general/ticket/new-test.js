import Ember from 'ember';
import { test, skip } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
// import timemachine from 'vendor/timemachine';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import {ticket_payload, required_ticket_payload} from 'bsrs-ember/tests/helpers/payloads/ticket';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CD from 'bsrs-ember/vendor/defaults/category';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/tickets';
import moment from 'moment';
import { POWER_SELECT_OPTIONS, TICKET_ASSIGNEE_SELECT, TICKET_STATUS_SELECT, TICKET_PRIORITY_SELECT, TICKET_LOCATION_SELECT } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { TICKETS_URL, TICKET_LIST_URL, LOCATIONS_URL, PEOPLE_URL, CATEGORIES_URL, DT_URL } from 'bsrs-ember/utilities/urls';
import { TICKET_ASSIGNEE, PS_SEARCH } from 'bsrs-ember/tests/helpers/const-names';

const TICKET_NEW_URL = TICKET_LIST_URL + '/new/1';
const CC_SEARCH = '.ember-power-select-trigger-multiple-input';
const PD = PERSON_DEFAULTS.defaults();

let list_xhr, location_xhr, people_xhr, counter;

moduleForAcceptance('Acceptance | general ticket new test', {
  beforeEach() {
    list_xhr = xhr(`${TICKETS_URL}?page=1`, 'GET', null, {}, 200, TF.empty());
    location_xhr = xhr(`${LOCATIONS_URL}location__icontains=6/`, 'GET', null, {}, 200, LF.search_power_select());
    counter = 0;
    random.uuid = function() { return UUID.value; };
    // timemachine.config({
    //   dateString: 'December 25, 2015 13:12:59'
    // });
  },
  afterEach() {
    counter = 0;
  }
});

test('validation works and when hit save, we do same post', function(assert) {
  page.visit();
  andThen(() => {
    patchRandom(counter);
  });
  click('.t-add-new');
  ajax(`${PEOPLE_URL}person__icontains=b/`, 'GET', null, {}, 200, PF.search_power_select());
  selectSearch(TICKET_ASSIGNEE_SELECT, 'b');
  selectChoose(TICKET_ASSIGNEE_SELECT, PD.fullnameBoy2);
  selectChoose(TICKET_STATUS_SELECT, TD.statusOne);
  selectChoose(TICKET_PRIORITY_SELECT, TD.priorityOne);
  selectSearch(TICKET_LOCATION_SELECT, '6');
  selectChoose(TICKET_LOCATION_SELECT, LD.storeNameTwo);
  // page.locationClickOptionTwo();
  let top_level_categories_endpoint = `${CATEGORIES_URL}parents/`;
  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  ajax(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
  selectChoose('.t-model-category-select:eq(0)', CD.nameOne);
  selectChoose('.t-model-category-select:eq(1)', CD.nameTwo);
  selectChoose('.t-model-category-select:eq(2)', CD.nameElectricalChild);
  page.requestFillIn(TD.requestOneGrid);
  page.requesterFillIn(TD.requesterOne);
  andThen(() => {
    assert.equal(currentURL(), TICKET_NEW_URL);
    assert.equal(document.title, t('doctitle.ticket.new'));
    assert.equal(Ember.$('.validated-input-error-dialog').length, 0, 'initial validation errors is zero');
    assert.notOk(page.requestValidationErrorVisible);
    assert.notOk(page.requesterValidationErrorVisible);
    assert.notOk(page.requesterValidationErrorVisible);
    assert.notOk(page.categoryValidationErrorVisible);
  });
  page.requestFillIn('');
  triggerEvent('.t-ticket-request-single', 'keyup', {keyCode: 32});
  page.requesterFillIn('');
  triggerEvent('.t-ticket-requester', 'keyup', {keyCode: 32});
  andThen(() => {
    assert.equal(currentURL(), TICKET_NEW_URL);
    // assert.equal(Ember.$('.validated-input-error-dialog').length, 2);
    assert.ok(page.requestValidationErrorVisible);
    assert.ok(page.requesterValidationErrorVisible);
    assert.notOk(page.locationValidationErrorVisible);
    assert.notOk(page.categoryValidationErrorVisible);
  });
});

test('selecting a top level category will alter the url and can cancel/discard changes and return to index', function(assert) {
  page.visit();
  andThen(() => {
    patchRandom(counter);
  });
  click('.t-add-new');
  clearxhr(location_xhr);
  andThen(() => {
    let components = page.powerSelectComponents;
    assert.equal( this.store.find('category').get('length'), 0);
    let tickets = this.store.find('ticket');
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 0);
    assert.ok(tickets.objectAt(0).get('isNotDirtyOrRelatedNotDirty'));
    // assert.ok(tickets.objectAt(0).get('categoriesIsNotDirty'));//jenkins fail
    assert.equal(components, 1);
  });
  let top_level_categories_endpoint = `${CATEGORIES_URL}parents/`;
  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  selectChoose('.t-model-category-select:eq(0)', CD.nameOne);
  andThen(() => {
    let components = page.powerSelectComponents;
    assert.equal( this.store.find('ticket').get('length'), 1);
    assert.equal( this.store.find('category').get('length'), 3);
    let tickets = this.store.find('ticket');
    assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
    assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
    // assert.ok(tickets.objectAt(0).get('categoriesIsDirty'));
    assert.equal(components, 2);
    assert.equal(find('.t-model-category-label:eq(0)').text(), CD.labelOne);
    assert.equal(find('.t-model-category-label:eq(1)').text(), CD.subCatLabelOne);
  });
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [], CD.idOne, 1));
  selectChoose('.t-model-category-select:eq(1)', CD.nameTwo);
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = this.store.find('ticket');
    assert.equal(tickets.get('length'), 1);
    assert.equal( this.store.find('category').get('length'), 3);
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
    assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 2);
    assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('children').get('length'), 0);
    assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
    // assert.ok(tickets.objectAt(0).get('categoriesIsDirty'));
    assert.equal(components, 2);
  });
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), TICKET_NEW_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      // assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), TICKET_NEW_URL);
      assert.ok(generalPage.modalIsHidden);
      let components = page.powerSelectComponents;
      let tickets = this.store.find('ticket');
      assert.equal(tickets.get('length'), 1);
      assert.equal( this.store.find('category').get('length'), 3);
      assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
      assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 2);
      assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('children').get('length'), 0);
      assert.equal(components, 2);
    });
  });
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), TICKET_NEW_URL);
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
      assert.equal(currentURL(), TICKET_LIST_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('selecting category tree and removing a top level category will remove children categories already selected', function(assert) {
  clearxhr(location_xhr);
  //clear out first xhr to change unusedId has_children to true
  page.visitNew();
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = this.store.find('ticket');
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 0);
    assert.equal(components, 1);
  });
  //first select
  let top_level_categories_endpoint = `${CATEGORIES_URL}parents/`;
  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  selectChoose('.t-model-category-select:eq(0)', CD.nameOne);
  andThen(() => {
    let components = page.powerSelectComponents;
    assert.equal( this.store.find('ticket').get('length'), 1);
    let tickets = this.store.find('ticket');
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
    assert.equal(components, 2);
  });
  //second select
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  selectChoose('.t-model-category-select:eq(1)', CD.nameTwo);
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = this.store.find('ticket');
    assert.equal(tickets.get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
    assert.equal(components, 3);
  });
  //third select
  ajax(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
  selectChoose('.t-model-category-select:eq(2)', CD.nameElectricalChild);
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = this.store.find('ticket');
    assert.equal(tickets.get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 3);
    assert.equal(components, 3);
  });
  //change second with same children as electrical (outlet);
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.unusedId, CD.nameUnused, [{id: CD.idChild}], CD.idOne, 1));
  selectChoose('.t-model-category-select:eq(1)', CD.nameUnused);
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = this.store.find('ticket');
    assert.equal(tickets.get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
    assert.equal(components, 3);
  });
  //change top level
  selectChoose('.t-model-category-select:eq(0)', CD.nameThree);
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = this.store.find('ticket');
    assert.equal(tickets.get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 0);
    assert.equal(components, 1);
  });
});

test('when selecting a new parent cateogry it should remove previously selected child category', function(assert) {
  clearxhr(location_xhr);
  page.visitNew();
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = this.store.find('ticket');
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 0);
    assert.equal(components, 1);
  });
  let top_level_categories_endpoint = `${CATEGORIES_URL}parents/`;
  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  //first select
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionOne();
  andThen(() => {
    let components = page.powerSelectComponents;
    assert.equal( this.store.find('ticket').get('length'), 1);
    let tickets = this.store.find('ticket');
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
    assert.equal(components, 2);
  });
  //second select
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionOne();
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = this.store.find('ticket');
    assert.equal(tickets.get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
    assert.equal(components, 3);
  });
  //third select
  ajax(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
  page.categoryThreeClickDropdown();
  page.categoryThreeClickOptionOne();
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = this.store.find('ticket');
    assert.equal(tickets.get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 3);
    assert.equal(components, 3);
  });
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.unusedId, CD.nameUnused, [{id: CD.idChild}], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionTwo();
  andThen(() => {
    let ticket = this.store.findOne('ticket');
    assert.ok(!ticket.get('_location'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    let components = page.powerSelectComponents;
    assert.equal(components, 3);
  });
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionTwo();
  andThen(() => {
    let ticket = this.store.findOne('ticket');
    assert.ok(!ticket.get('_location'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    let components = page.powerSelectComponents;
    assert.equal(components, 1);
  });
});

/*TICKET TO ASSIGNEE*/
test('assignee component shows assignee for ticket and will fire off xhr to fetch assignees on search to change assignee', function(assert) {
  clearxhr(location_xhr);
  page.visitNew();
  andThen(() => {
    assert.equal(page.assigneeInput, t(GLOBALMSG.assignee_power_select));
    let ticket = this.store.findOne('ticket');
    assert.equal(ticket.get('assignee.id'), undefined);
    assert.equal(ticket.get('assignee_fk'), undefined);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  });
  xhr(`${PEOPLE_URL}person__icontains=b/`, 'GET', null, {}, 200, PF.search_power_select());
  selectSearch(TICKET_ASSIGNEE_SELECT, 'b');
  selectChoose(TICKET_ASSIGNEE_SELECT, PD.fullnameBoy);
  andThen(() => {
    assert.equal(page.assigneeInput, `${PD.nameBoy} ${PD.lastNameBoy}`);
  });
  selectSearch(TICKET_ASSIGNEE_SELECT, '');
  andThen(() => {
    assert.equal(page.assigneeOptionLength, 1);
    assert.equal(page.assigneeInput, `${PD.nameBoy} ${PD.lastNameBoy}`);
  });
  selectSearch(TICKET_ASSIGNEE_SELECT, 'b');
  selectChoose(TICKET_ASSIGNEE_SELECT, PD.fullnameBoy2);
  andThen(() => {
    assert.equal(page.assigneeInput, `${PD.nameBoy2} ${PD.lastNameBoy2}`);
    let ticket = this.store.findOne('ticket');
    assert.equal(ticket.get('assignee.id'), PD.idSearch);
    assert.equal(ticket.get('assignee_fk'), undefined);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  //search specific assignee
  xhr(`${PEOPLE_URL}person__icontains=Boy1/`, 'GET', null, {}, 200, PF.search_power_select());
  selectSearch(TICKET_ASSIGNEE_SELECT, 'Boy1');
  selectChoose(TICKET_ASSIGNEE_SELECT, PD.fullnameBoy);
  andThen(() => {
    assert.equal(page.assigneeInput, `${PD.nameBoy} ${PD.lastNameBoy}`);
    let ticket = this.store.findOne('ticket');
    assert.equal(ticket.get('assignee.id'), PD.idBoy);
    assert.equal(ticket.get('assignee_fk'), undefined);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
});

/*TICKET TO LOCATION 1 to Many*/
test('selecting new location will not affect other power select components and will only render one tab', function(assert) {
  page.visitNew();
  selectChoose(TICKET_PRIORITY_SELECT, TD.priorityOne);
  selectSearch(TICKET_LOCATION_SELECT, '6');
  selectChoose(TICKET_LOCATION_SELECT, LD.storeNameTwo);
  andThen(() => {
    assert.equal(page.priorityInput, TD.priorityOne);
    assert.equal(page.locationInput, LD.storeNameTwo);
    assert.equal(find('.t-tab').length, 1);
  });
});

test('location new component shows location for ticket and will fire off xhr to fetch locations on search to change location', function(assert) {
  page.visitNew();
  selectSearch(TICKET_LOCATION_SELECT, '6');
  selectChoose(TICKET_LOCATION_SELECT, LD.storeNameTwo);
  andThen(() => {
    assert.equal(page.locationInput, LD.storeNameTwo);
    let ticket = this.store.find('ticket');
    assert.equal(ticket.objectAt(0).get('location.id'), LD.idTwo);
    assert.equal(ticket.objectAt(0).get('location_fk'), undefined);
    assert.ok(ticket.objectAt(0).get('isDirtyOrRelatedDirty'));
  });
});

test('removes location dropdown on search to change location', function(assert) {
  page.visitNew();
  selectSearch(TICKET_LOCATION_SELECT, '6');
  andThen(() => {
    assert.equal(page.locationOptionLength, 2);
  });
  fillIn(PS_SEARCH, ' ');
  andThen(() => {
    assert.equal(find(`${POWER_SELECT_OPTIONS}`).text().trim(), GLOBALMSG.power_search);
  });
  fillIn(PS_SEARCH, '6');
  andThen(() => {
    assert.equal(page.locationOptionLength, 2);
  });
});

/*TICKET CC M2M*/
test('clicking and typing into power select for people will fire off xhr request for all people', function(assert) {
  clearxhr(location_xhr);
  page.visitNew();
  andThen(() => {
    let ticket = this.store.findOne('ticket');
    assert.ok(!ticket.get('cc.length'));
  });
  let people_endpoint = `${PEOPLE_URL}person__icontains=a/`;
  ajax(people_endpoint, 'GET', null, {}, 200, PF.get_for_power_select(PD.idDonald, PD.donald_first_name, PD.donald_last_name));
  page.ccClickDropdown();
  fillIn(`${CC_SEARCH}`, 'a');
  andThen(() => {
    assert.equal(page.ccOptionLength, 1);
    assert.equal(find(`${POWER_SELECT_OPTIONS} > li:eq(0)`).text().trim(), PD.donald);
  });
  page.ccClickDonald();
  andThen(() => {
    let ticket = this.store.findOne('ticket');
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
    assert.equal(page.ccSelected.indexOf(PD.donald), 2);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  page.ccClickDropdown();
  fillIn(`${CC_SEARCH}`, '');
  andThen(() => {
    assert.equal(page.ccOptionLength, 1);
    assert.equal(find(`${POWER_SELECT_OPTIONS} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
  });
  fillIn(`${CC_SEARCH}`, 'a');
  andThen(() => {
    assert.equal(page.ccSelected.indexOf(PD.donald), 2);
    assert.equal(page.ccOptionLength, 1);
    assert.equal(find(`${POWER_SELECT_OPTIONS} > li:eq(0)`).text().trim(), PD.donald);
    let ticket = this.store.findOne('ticket');
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
  });
  //search specific cc
  page.ccClickDropdown();
  xhr(`${PEOPLE_URL}person__icontains=Boy/`, 'GET', null, {}, 200, PF.search_power_select());
  fillIn(`${CC_SEARCH}`, 'Boy');
  andThen(() => {
    assert.equal(page.ccSelected.indexOf(PD.donald), 2);
    assert.equal(page.ccOptionLength, 10);
    assert.equal(find(`${POWER_SELECT_OPTIONS} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
    let ticket = this.store.findOne('ticket');
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
  });
  page.ccClickOptionOne();
  andThen(() => {
    assert.equal(page.ccSelected.indexOf(PD.donald), 2);
    assert.equal(page.ccTwoSelected.indexOf(PD.nameBoy), 2);
    let ticket = this.store.findOne('ticket');
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
    assert.equal(ticket.get('cc').objectAt(1).get('id'), PD.idBoy);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
});

test('can remove and add back same cc and save empty cc', function(assert) {
  clearxhr(location_xhr);
  page.visitNew();
  andThen(() => {
    let ticket = this.store.findOne('ticket');
    assert.ok(!ticket.get('cc.length'));
  });
  let people_endpoint = `${PEOPLE_URL}person__icontains=a/`;
  ajax(people_endpoint, 'GET', null, {}, 200, PF.get_for_power_select(PD.idDonald, PD.donald_first_name, PD.donald_last_name));
  page.ccClickDropdown();
  fillIn(`${CC_SEARCH}`, 'a');
  andThen(() => {
    assert.equal(page.ccOptionLength, 1);
    assert.equal(find(`${POWER_SELECT_OPTIONS} > li:eq(0)`).text().trim(), PD.donald);
  });
  page.ccClickDonald();
  andThen(() => {
    let ticket = this.store.findOne('ticket');
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
    assert.equal(page.ccSelected.indexOf(PD.donald), 2);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  page.ccOneRemove();
  andThen(() => {
    let ticket = this.store.findOne('ticket');
    assert.equal(ticket.get('cc').get('length'), 0);
  });
});

skip('all required fields persist correctly when the user submits a new ticket form', function(assert) {
  page.visit();
  andThen(() => {
    patchRandom(counter);
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), TICKET_NEW_URL);
    assert.equal( this.store.find('ticket').get('length'), 1);
    const ticket = this.store.find('ticket', UUID.value);
    assert.ok(ticket.get('isNotDirty'));
  });
  people_xhr = xhr(`${PEOPLE_URL}person__icontains=b/`, 'GET', null, {}, 200, PF.search_power_select());
  selectSearch(TICKET_ASSIGNEE, 'b');
  page.assigneeClickOptionTwo();
  andThen(() => {
    assert.equal(page.assigneeInput, `${PD.nameBoy2} ${PD.lastNameBoy2}`);
    let ticket = this.store.findOne('ticket');
    assert.ok(ticket.get('assignee'));
    assert.equal(ticket.get('assignee').get('id'), PD.idSearch);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  page.statusClickDropdown();
  page.statusClickOptionOne();
  page.priorityClickDropdown();
  page.priorityClickOptionOne();
  andThen(() => {
    let ticket = this.store.find('ticket', UUID.value);
    assert.equal(ticket.get('assignee').get('id'), PD.idSearch);
    assert.equal(ticket.get('status.id'), TD.statusOneId);
    assert.equal(ticket.get('priority.id'), TD.priorityOneId);
  });
  page.locationClickDropdown();
  fillIn(PS_SEARCH, '6');
  andThen(() => {
    //ensure route doesn't change current selections
    assert.equal(page.locationOptionLength, 2);
    let ticket = this.store.find('ticket', UUID.value);
    assert.equal(ticket.get('assignee').get('id'), PD.idSearch);
    assert.equal(ticket.get('status.id'), TD.statusOneId);
    assert.equal(ticket.get('priority.id'), TD.priorityOneId);
  });
  page.locationClickOptionTwo();
  let top_level_categories_endpoint = `${CATEGORIES_URL}parents/`;
  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  ajax(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionOne();
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionOne();
  page.categoryThreeClickDropdown();
  page.categoryThreeClickOptionOne();
  page.requestFillIn(TD.requestOneGrid);
  page.requesterFillIn(TD.requesterOne);
  required_ticket_payload.request = TD.requestOneGrid;
  xhr(TICKETS_URL, 'POST', JSON.stringify(required_ticket_payload), {}, 201, Ember.$.extend(true, {}, required_ticket_payload));
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal( this.store.find('ticket').get('length'), 1);
    let persisted = this.store.find('ticket', UUID.value);
    assert.ok(persisted.get('assignee'));
    assert.equal(persisted.get('new'), undefined);
    assert.equal(persisted.get('assignee.id'), PD.idSearch);
    assert.equal(persisted.get('request'), TD.requestOneGrid);
    assert.ok(persisted.get('location'));
    assert.equal(persisted.get('location.id'), LD.idTwo);
    assert.equal(persisted.get('status.id'), TD.statusOneId);
    assert.ok(persisted.get('isNotDirty'));
    assert.ok(persisted.get('isNotDirtyOrRelatedNotDirty'));
  });
});

test('adding a new ticket should allow for another new ticket to be created after the first is persisted', function(assert) {
  ajax(`${PEOPLE_URL}person__icontains=b/`, 'GET', null, {}, 200, PF.search_power_select());
  page.visit();
  andThen(() => {
    patchRandom(counter);
  });
  click('.t-add-new');
  selectSearch(TICKET_ASSIGNEE_SELECT, 'b');
  selectChoose(TICKET_ASSIGNEE_SELECT, PD.fullnameBoy2);
  selectChoose(TICKET_STATUS_SELECT, TD.statusOne);
  selectChoose(TICKET_PRIORITY_SELECT, TD.priorityOne);
  selectSearch(TICKET_LOCATION_SELECT, '6');
  selectChoose(TICKET_LOCATION_SELECT, LD.storeNameTwo);
  // page.locationClickOptionTwo();
  let top_level_categories_endpoint = `${CATEGORIES_URL}parents/`;
  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  ajax(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
  selectChoose('.t-model-category-select:eq(0)', CD.nameOne);
  selectChoose('.t-model-category-select:eq(1)', CD.nameTwo);
  selectChoose('.t-model-category-select:eq(2)', CD.nameElectricalChild);
  page.requestFillIn(TD.requestOneGrid);
  page.requesterFillIn(TD.requesterOne);
  required_ticket_payload.request = TD.requestOneGrid;
  xhr(TICKETS_URL, 'POST', JSON.stringify(required_ticket_payload), {}, 201, Ember.$.extend(true, {}, required_ticket_payload));
  generalPage.save();
  andThen(() => {
    assert.ok(urlContains(currentURL(), TICKET_LIST_URL));
    assert.equal( this.store.find('ticket').get('length'), 1);
  });
  click('.t-add-new');
  andThen(() => {
    assert.ok(urlContains(currentURL(), TICKET_NEW_URL));
    assert.equal( this.store.find('ticket').get('length'), 2);
    assert.equal(page.request, '');
  });
});

test('ticket category shows validation messages as you select through the tree', function(assert) {
  clearxhr(location_xhr);
  page.visit();
  click('.t-add-new');
  let top_level_categories_endpoint = `${CATEGORIES_URL}parents/`;
  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  ajax(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
  click('.t-model-category-select .ember-power-select-trigger');
  triggerEvent('.t-model-category-select .ember-power-select-trigger', 'blur');
  andThen(() => {
    assert.equal(Ember.$('.t-validation-ticket-category-top').length, 1);
    assert.equal(Ember.$('.t-validation-ticket-category-top').text().trim(), t('errors.ticket.category.top'));
  });
  selectChoose('.t-model-category-select:eq(0)', CD.nameOne);
  click('.t-model-category-select:eq(1) .ember-power-select-trigger');
  triggerEvent('.t-model-category-select:eq(1) .ember-power-select-trigger', 'blur');
  andThen(() => {
    assert.equal(Ember.$('.t-validation-ticket-category').length, 1);
    assert.equal(Ember.$('.t-validation-ticket-category').text().trim(), t('errors.ticket.categoryTrade'));
  });
  selectChoose('.t-model-category-select:eq(1)', CD.nameTwo);
  click('.t-model-category-select:eq(2) .ember-power-select-trigger');
  triggerEvent('.t-model-category-select:eq(2) .ember-power-select-trigger', 'blur');
  andThen(() => {
    assert.equal(Ember.$('.t-validation-ticket-category').length, 1);
    assert.equal(Ember.$('.t-validation-ticket-category').text().trim(), 'errors.ticket.category');
  });
});
