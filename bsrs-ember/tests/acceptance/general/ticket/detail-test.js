import Ember from 'ember';
const { run } = Ember;
import { test, skip } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import {ticket_payload, ticket_payload_with_comment, ticket_payload_detail_with_assignee, ticket_payload_detail, ticket_payload_detail_one_category} from 'bsrs-ember/tests/helpers/payloads/ticket';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
//import PEOPLE_CURRENT_DEFAULTS from 'bsrs-ember/vendor/defaults/person-current';
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
import { POWER_SELECT_OPTIONS, TICKET_CC_SELECT } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { TICKETS_URL, TICKET_LIST_URL, LOCATIONS_URL, PEOPLE_URL, CATEGORIES_URL, DT_URL } from 'bsrs-ember/utilities/urls';
import { TICKET_ASSIGNEE, PS_SEARCH } from 'bsrs-ember/tests/helpers/const-names';

const PREFIX = config.APP.NAMESPACE;
const DETAIL_URL = `${TICKET_LIST_URL}/${TD.idOne}`;
const TICKET_PUT_URL = `${PREFIX}${DETAIL_URL}/`;
const PD = PERSON_DEFAULTS.defaults();

let list_xhr, detail_xhr, top_level_xhr, detail_data, activity_one;

moduleForAcceptance('Acceptance | general ticket detail', {
  beforeEach() {
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


test('you can add a comment and post it while not updating created property', async function(assert) {
  let iso;
  await page.visitDetail();
  const date = new Date();
  date.setMonth(date.getMonth()-1);
  iso = date.toISOString();
  run(() => {
    this.store.push('ticket', {id: TD.idOne, created: iso});
  })
  assert.equal(find('.t-ticket-comment').attr('placeholder'), 'Enter a comment');
  page.commentFillIn(TD.commentOne);
  var ticket = this.store.find('ticket', TD.idOne);
  assert.equal(ticket.get('created'), iso);
  let response = TF.detail(TD.idOne);
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_with_comment), {}, 200, response);
  await generalPage.save();
  assert.ok(urlContains(currentURL(), TICKET_LIST_URL));
  ticket = this.store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('comment'), '');
  assert.equal(ticket.get('created'), iso);
});

test('when you deep link to the ticket detail view you get bound attrs', async function(assert) {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  var ticket = this.store.find('ticket', TD.idOne);
  assert.equal(document.title, t('doctitle.ticket.single', { number: '123zz' }));
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(page.priorityInput, TD.priorityOne);
  assert.equal(page.statusInput, TD.statusOne);
  assert.ok(find('.t-created-comment > span').text().includes(`${PD.nameMel} created this ticket`));
  page.priorityClickDropdown();
  page.priorityClickOptionTwo();
  page.statusClickDropdown();
  page.statusClickOptionTwo();
  const TOP_LEVEL_CATEGORIES_TICKET_LIST_URL = `${CATEGORIES_URL}parents/`;
  top_level_xhr = xhr(TOP_LEVEL_CATEGORIES_TICKET_LIST_URL, 'GET', null, {}, 200, CF.top_level());
  await page.categoryOneClickDropdown();
  await page.categoryOneClickOptionTwo();
  ticket = this.store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  assert.equal(page.priorityInput, TD.priorityTwo);
  assert.equal(page.statusInput, TD.statusTwo);
  page.requestFillIn(TD.requestOneGrid);
  let response = TF.detail(TD.idOne);
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_detail_one_category), {}, 200, response);
  await generalPage.save();
  assert.ok(urlContains(currentURL(), TICKET_LIST_URL));
  ticket = this.store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirty'));
});

test('when you click cancel, you are redirected to the ticket list view', async function(assert) {
  await page.visitDetail();
  await generalPage.cancel();
  assert.equal(currentURL(), TICKET_LIST_URL);
});

test('if ticket status is not draft/new, assignee is reqd', async function(assert) {
  detail_data.assignee = null;
  await page.visitDetail();
  const ticket = this.store.find('ticket', TD.idOne);
  assert.equal(ticket.get('status.name'), 'ticket.status.new');
  assert.equal(currentURL(), DETAIL_URL);
  assert.notOk(page.locationValidationErrorVisible);
  assert.notOk(page.assigneeValidationErrorVisible);
  // select Complete status
  await selectChoose('.t-ticket-status-select', t('ticket.status.complete'));
  assert.equal(ticket.get('isDirtyOrRelatedDirty'), true);
  assert.equal(find('.t-save-btn').attr('disabled'), 'disabled'); // invalid b/c need to select assignee
  xhr(`${PEOPLE_URL}person__icontains=b/`, 'GET', null, {}, 200, PF.search_power_select());
  await selectSearch(TICKET_ASSIGNEE, 'b');
  await selectChoose(TICKET_ASSIGNEE, PD.fullnameBoy2);
  assert.equal(find('.t-save-btn').attr('disabled'), undefined);
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', async function(assert) {
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

test('when click delete, modal displays and when click ok, ticket is deleted and removed from store', function(assert) {
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
      assert.ok(urlContains(currentURL(), TICKET_LIST_URL));
      assert.equal(this.store.find('ticket', TD.idOne).get('length'), undefined);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when click delete, and click no modal disappears', async function(assert) {
  await page.visitDetail();
  await generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(this.store.find('ticket').get('length'), 1);
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
      assert.equal(this.store.find('ticket').get('length'), 1);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('visiting detail should set the category even when it has no children', async function(assert) {
  clearxhr(detail_xhr);
  clearxhr(activity_one);
  xhr(`/api/tickets/${TD.idTwo}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
  let solo_data = TF.detail(TD.idTwo);
  solo_data.categories = [{id: CD.idSolo, name: CD.nameSolo, children: []}];
  xhr(TICKETS_URL + TD.idTwo + '/', 'GET', null, {}, 200, solo_data);
  await visit(TICKET_LIST_URL + '/' + TD.idTwo);
  assert.equal(currentURL(), TICKET_LIST_URL + '/' + TD.idTwo);
  let components = page.powerSelectComponents;
  assert.equal(components, 1);
  assert.equal(page.categoryOneInput, CD.nameSolo);
});

test('clicking cancel button will take from detail view to list view', async function(assert) {
  await page.visit();
  assert.equal(currentURL(), TICKET_LIST_URL);
  await click('.t-grid-data:eq(0)');
  assert.equal(currentURL(), DETAIL_URL);
  await generalPage.cancel();
  assert.equal(currentURL(), TICKET_LIST_URL);
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', function(assert) {
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
      assert.equal(currentURL(), TICKET_LIST_URL);
    });
  });
});

//*TICKET CC M2M*/
test('clicking and typing into power select for people will fire off xhr request for all people', function(assert) {
  page.visitDetail();
  andThen(() => {
    let ticket = this.store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.first_name);
    assert.equal(page.ccSelected.indexOf(PD.first_name), 2);
  });
  let PEOPLE_TICKETS_URL = `${PEOPLE_URL}person__icontains=a/`;
  xhr(PEOPLE_TICKETS_URL, 'GET', null, {}, 200, PF.get_for_power_select(PD.idDonald, PD.donald_first_name, PD.donald_last_name));
  selectSearch(TICKET_CC_SELECT, 'a');
  selectChoose(TICKET_CC_SELECT, PD.donald);
  andThen(() => {
    let ticket = this.store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 2);
    assert.equal(ticket.get('cc').objectAt(1).get('first_name'), PD.donald_first_name);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.first_name);
    assert.equal(page.ccTwoSelected.indexOf(PD.donald), 2);
    assert.equal(page.ccSelected.indexOf(PD.first_name), 2);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  xhr(`${PEOPLE_URL}person__icontains=Boy/`, 'GET', null, {}, 200, PF.search_power_select());
  selectSearch(TICKET_CC_SELECT, 'Boy');
  selectChoose(TICKET_CC_SELECT, PD.nameBoy);
  andThen(() => {
    assert.equal(page.ccTwoSelected.indexOf(PD.donald), 2);
    assert.equal(page.ccSelected.indexOf(PD.first_name), 2);
    assert.equal(page.ccThreeSelected.indexOf(PD.nameBoy), 2);
    let ticket = this.store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').objectAt(1).get('first_name'), PD.donald_first_name);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.first_name);
    assert.equal(ticket.get('cc').objectAt(2).get('id'), PD.idBoy);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
});

test('can remove and add back same cc and save empty cc', function(assert) {
  page.visitDetail();
  andThen(() => {
    let ticket = this.store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  });
  removeMultipleOption(TICKET_CC_SELECT, PD.fullname);
  andThen(() => {
    let ticket = this.store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 0);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  let PEOPLE_TICKETS_URL = `${PEOPLE_URL}person__icontains=a/`;
  xhr(PEOPLE_TICKETS_URL, 'GET', null, {}, 200, PF.get_for_power_select(PD.idDonald, PD.donald_first_name, PD.donald_last_name));
  selectSearch(TICKET_CC_SELECT, 'a');
  selectChoose(TICKET_CC_SELECT, PD.donald);
  andThen(() => {
    let ticket = this.store.find('ticket', TD.idOne);
    assert.equal(ticket.get('ticket_cc_fks').length, 1);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  removeMultipleOption(TICKET_CC_SELECT, PD.donald);
  andThen(() => {
    let ticket = this.store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 0);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  xhr(`${PEOPLE_URL}person__icontains=Mel/`, 'GET', null, {}, 200, PF.get_for_power_select());
  selectSearch(TICKET_CC_SELECT, 'Mel');
  selectChoose(TICKET_CC_SELECT, PD.nameMel);
  selectSearch(TICKET_CC_SELECT, 'a');
  selectChoose(TICKET_CC_SELECT, PD.donald);
  andThen(() => {
    let ticket = this.store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 2);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  let payload = TF.put({id: TD.idOne, cc: [PD.idOne, PD.idDonald]});
  const response = Ember.$.extend(true, {}, payload);
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.ok(urlContains(currentURL(), TICKET_LIST_URL));
  });
});

test('starting with multiple cc, can remove all ccs (while not populating options) and add back', function(assert) {
  detail_data.cc = [...detail_data.cc, PF.get_no_related(PD.idTwo)];
  detail_data.cc[1].first_name = PD.first_name + 'i';
  page.visitDetail();
  andThen(() => {
    let ticket = this.store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 2);
    assert.equal(ticket.get('ticket_cc_fks').length, 2);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(page.ccsSelected, 2);
  });
  page.ccTwoRemove();
  andThen(() => {
    let ticket = this.store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.equal(page.ccsSelected, 1);
  });
  page.ccOneRemove();
  andThen(() => {
    let ticket = this.store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 0);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.equal(page.ccsSelected, 0);
  });
  let PEOPLE_TICKETS_URL = `${PEOPLE_URL}person__icontains=Mel/`;
  xhr(PEOPLE_TICKETS_URL, 'GET', null, {}, 200, PF.get_for_power_select());
  selectSearch('.t-ticket-cc-select', 'Mel');
  selectChoose('.t-ticket-cc-select', PD.nameMel);
  andThen(() => {
    let ticket = this.store.find('ticket', TD.idOne);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.equal(page.ccsSelected, 1);
  });
  let payload = TF.put({id: TD.idOne, cc: [PD.idOne]});
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.ok(urlContains(currentURL(), TICKET_LIST_URL));
  });
});

test('clicking and typing into db-multi power select for people will fire xhr if spacebar pressed', function(assert) {
  page.visitDetail();
  page.ccClickDropdown();
  selectSearch(TICKET_CC_SELECT, ' ');
  andThen(() => {
    assert.equal(page.ccSelected.indexOf(PD.first_name), 2);
    assert.equal(page.ccOptionLength, 1);
    assert.equal(find(`${POWER_SELECT_OPTIONS} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
  });
});

/*TICKET CATEGORIES M2M*/
test('categories are in order based on text', function(assert) {
  page.visitDetail();
  andThen(() => {
    assert.equal(page.categoryOneInput, CD.nameOne);
    assert.equal(page.categoryTwoInput, CD.nameRepairChild);
    assert.equal(page.categoryThreeInput, CD.namePlumbingChild);
  });
});

test('power select options are rendered immediately when enter detail route and can save different top level category', function(assert) {
  let top_level_data = CF.top_level();
  top_level_data.results[1] = {id: CD.idThree, name: CD.nameThree, children: [{id: CD.idLossPreventionChild, name: CD.nameLossPreventionChild}], level: 0};
  page.visitDetail();
  andThen(() => {
    let components = page.powerSelectComponents;
    assert.equal(components, 3);
    let ticket = this.store.find('ticket', TD.idOne);
    assert.equal(ticket.get('top_level_category').get('id'), CD.idOne);
    assert.equal(ticket.get('categories').get('length'), 3);
  });
  let TOP_LEVEL_CATEGORIES_TICKET_LIST_URL = `${CATEGORIES_URL}parents/`;
  xhr(TOP_LEVEL_CATEGORIES_TICKET_LIST_URL, 'GET', null, {}, 200, top_level_data);
  page.categoryOneClickDropdown();
  andThen(() => {
    assert.equal(page.categoryOneInput, CD.nameOne);
    assert.equal(page.categoryOneOptionLength, 2);
  });
  page.categoryOneClickDropdown();
  xhr(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get(CD.idTwo, CD.nameTwo));
  page.categoryTwoClickDropdown();
  andThen(() => {
    assert.equal(page.categoryTwoInput, CD.nameRepairChild);
  });
  page.categoryTwoClickDropdown();
  xhr(`${CATEGORIES_URL}?parent=${CD.idPlumbing}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbing, CD.nameRepairChild));
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
    let ticket = this.store.find('ticket', TD.idOne);
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
  xhr(`${CATEGORIES_URL}?parent=${CD.idThree}&page_size=1000`, 'GET', null, {}, 200, security);
  page.categoryTwoClickDropdown();
  andThen(() => {
    assert.equal(page.categoryTwoOptionLength, 1);
  });
  page.categoryTwoClickOptionSecurity();
  andThen(() => {
    assert.equal(page.categoryTwoInput, CD.nameLossPreventionChild);
  });
  const payload = TF.put({id: TD.idOne, categories: [CD.idThree, CD.idLossPreventionChild]});
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.ok(urlContains(currentURL(), TICKET_LIST_URL));
  });
});

test('selecting a top level category will alter the url and can cancel/discard changes and return to index', function(assert) {
  page.visitDetail();
  andThen(() => {
    //override electrical to have children
    this.store.push('category-children', {id: CCD.idOne, category_pk: CD.idTwo, child_pk: CD.idChild});
    let cat = this.store.push('category', {id: CD.idTwo, name: CD.nameTwo, category_children_fks: [CCD.idOne], parent_id: CD.idOne, level: 1});
    cat.save();
    let components = page.powerSelectComponents;
    assert.equal(this.store.find('category').get('length'), 4);
    let ticket = this.store.find('ticket', TD.idOne);
    assert.equal(ticket.get('categories').get('length'), 3);
    // assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    // assert.ok(ticket.get('categoriesIsNotDirty'));
    assert.equal(components, 3);
  });
  // select same
  let TOP_LEVEL_CATEGORIES_TICKET_LIST_URL = `${CATEGORIES_URL}parents/`;
  top_level_xhr = xhr(TOP_LEVEL_CATEGORIES_TICKET_LIST_URL, 'GET', null, {}, 200, CF.top_level());
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionOne();
  andThen(() => {
    let components = page.powerSelectComponents;
    assert.equal(this.store.find('ticket').get('length'), 1);
    let ticket = this.store.find('ticket', TD.idOne);
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
  xhr(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id:CD.idChild}], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionElectrical();
  andThen(() => {
    let components = page.powerSelectComponents;
    let ticket = this.store.find('ticket', TD.idOne);
    assert.equal(this.store.find('category').get('length'), 5);
    assert.equal(ticket.get('categories').get('length'), 2);
    assert.equal(ticket.get('sorted_categories').get('length'), 2);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('children').get('length'), 2);
    // assert.equal(ticket.get('sorted_categories').objectAt(1).get('children').get('length'), 1);
    // assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    // assert.ok(ticket.get('categoriesIsDirty'));
    assert.equal(components, 3);
  });
  const payload = CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2);
  xhr(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, payload);
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
      let tickets = this.store.find('ticket');
      assert.equal(this.store.find('category').get('length'), 5);
      assert.equal(tickets.get('length'), 1);
      let ticket = this.store.find('ticket', TD.idOne);
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
      assert.equal(currentURL(), TICKET_LIST_URL);
    });
  });
});

test('changing tree and reverting tree should not show as dirty', function(assert) {
  let TOP_LEVEL_CATEGORIES_TICKET_LIST_URL = `${CATEGORIES_URL}parents/`;
  top_level_xhr = xhr(TOP_LEVEL_CATEGORIES_TICKET_LIST_URL, 'GET', null, {}, 200, CF.top_level());
  page.visitDetail();
  andThen(() => {
    //override electrical to have children
    this.store.push('category-children', {id: CCD.idOne, category_pk: CD.idTwo, child_pk: CD.idChild});
    let cat = this.store.push('category', {id: CD.idTwo, name: CD.nameTwo, category_children_fks: [CCD.idOne], parent_id: CD.idOne, level: 1});
    cat.save();
    let ticket = this.store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(ticket.get('categoriesIsNotDirty'));
  });
  //select same
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionOne();
  andThen(() => {
    let components = page.powerSelectComponents;
    let ticket = this.store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(ticket.get('categoriesIsNotDirty'));
  });
  //select electrical from second level
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionElectrical();
  andThen(() => {
    let ticket = this.store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.ok(ticket.get('categoriesIsDirty'));
  });
  xhr(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
  page.categoryThreeClickDropdown();
  page.categoryThreeClickOptionOne();
  andThen(() => {
    let ticket = this.store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.ok(ticket.get('categoriesIsDirty'));
  });
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbing, CD.nameRepairChild, [{id:CD.idPlumbingChild}], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionPlumbing();
  andThen(() => {
    let ticket = this.store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.ok(ticket.get('categoriesIsDirty'));
  });
  xhr(`${CATEGORIES_URL}?parent=${CD.idPlumbing}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbingChild, CD.namePlumbingChild, [], CD.idPlumbing, 2));
  page.categoryThreeClickDropdown();
  //reset tree back to original
  page.categoryThreeClickOptionToilet();
  andThen(() => {
    let ticket = this.store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(ticket.get('categoriesIsNotDirty'));
  });
});

test('selecting and removing a top level category will remove children categories already selected', function(assert) {
  let TOP_LEVEL_CATEGORIES_TICKET_LIST_URL = `${CATEGORIES_URL}parents/`;
  top_level_xhr = xhr(TOP_LEVEL_CATEGORIES_TICKET_LIST_URL, 'GET', null, {}, 200, CF.top_level());
  page.visitDetail();
  andThen(() => {
    let components = page.powerSelectComponents;
    assert.equal(this.store.find('category').get('length'), 4);
    let tickets = this.store.find('ticket');
  });
  //change top level
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionTwo();
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = this.store.find('ticket');
    assert.equal(tickets.get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 0);
    assert.equal(components, 1);
  });
});

test('when selecting a new parent category it should remove previously selected child category but if select same, it wont clear tree', function(assert) {
  page.visitDetail();
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbing, CD.nameRepairChild, [{id: CD.idChild}], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionPlumbing();
  andThen(() => {
    let ticket = this.store.findOne('ticket');
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('categories').get('length'), 3);
    let components = page.powerSelectComponents;
    assert.equal(components, 3);
  });
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionElectrical();
  andThen(() => {
    let ticket = this.store.findOne('ticket');
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.equal(ticket.get('categories').get('length'), 2);
    let components = page.powerSelectComponents;
    assert.equal(components, 3);
  });
  let TOP_LEVEL_CATEGORIES_TICKET_LIST_URL = `${CATEGORIES_URL}parents/`;
  top_level_xhr = xhr(TOP_LEVEL_CATEGORIES_TICKET_LIST_URL, 'GET', null, {}, 200, CF.top_level());
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionTwo();
  andThen(() => {
    let ticket = this.store.findOne('ticket');
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.equal(ticket.get('categories').get('length'), 1);
    let components = page.powerSelectComponents;
    assert.equal(components, 1);
  });
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionOne();
  xhr(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionOne();
  page.categoryThreeClickDropdown();
  page.categoryThreeClickOptionOne();
  let payload = ticket_payload_detail;
  payload.categories = [CD.idOne, CD.idTwo , CD.idChild];
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.ok(urlContains(currentURL(), TICKET_LIST_URL));
  });
});

/*TICKET TO LOCATION*/
test('location component shows location for ticket and will fire off xhr to fetch locations on search to change location', function(assert) {
  page.visitDetail();
  andThen(() => {
    assert.equal(page.locationInput, LD.storeName);
    let ticket = this.store.find('ticket', TD.idOne);
    assert.equal(ticket.get('location.id'), LD.idOne);
    assert.equal(ticket.get('location_fk'), LD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('top_level_category').get('id'), CD.idOne);
  });
  // <check category tree>
  xhr(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbing, CD.nameRepairChild, [CD.idPlumbingChild], CD.idOne, 1));
  page.categoryOneClickDropdown();
  andThen(() => {
    assert.equal(page.categoryOneInput, CD.nameOne);
    assert.equal(page.categoryOneOptionLength, 2);
  });
  const TOP_LEVEL_CATEGORIES_TICKET_LIST_URL = `${CATEGORIES_URL}parents/`;
  top_level_xhr = xhr(TOP_LEVEL_CATEGORIES_TICKET_LIST_URL, 'GET', null, {}, 200, CF.top_level());
  page.categoryOneClickDropdown();
  page.categoryTwoClickDropdown();
  andThen(() => {
    assert.equal(page.categoryTwoInput, CD.nameRepairChild);
    // assert.equal(page.categoryTwoOptionLength, 1);//fetch data will change this to 2 once implemented
  });
  xhr(`${CATEGORIES_URL}?parent=${CD.idPlumbing}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbingChild, CD.namePlumbingChild, [], CD.idPlumbing, 2));
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
  fillIn(PS_SEARCH, '6');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.locationInput, LD.storeName);
    assert.equal(page.locationOptionLength, 2);
    assert.equal(find(`${POWER_SELECT_OPTIONS} > li:eq(0)`).text().trim(), LD.storeNameFour);
    assert.equal(find(`${POWER_SELECT_OPTIONS} > li:eq(1)`).text().trim(), LD.storeNameTwo);
  });
  page.locationClickOptionTwo();
  andThen(() => {
    assert.equal(page.locationInput, LD.storeNameTwo);
  });
  page.locationClickDropdown();
  fillIn(PS_SEARCH, '');
  andThen(() => {
    assert.equal(page.locationOptionLength, 1);
    assert.equal(find(`${POWER_SELECT_OPTIONS}`).text().trim(), GLOBALMSG.power_search);
  });
  fillIn(PS_SEARCH, '6');
  andThen(() => {
    assert.equal(page.locationInput, LD.storeNameTwo);
    assert.equal(page.locationOptionLength, 2);
    assert.equal(find(`${POWER_SELECT_OPTIONS} > li:eq(0)`).text().trim(), LD.storeNameFour);
    assert.equal(find(`${POWER_SELECT_OPTIONS} > li:eq(1)`).text().trim(), LD.storeNameTwo);
  });
  page.locationClickOptionTwo();
  andThen(() => {
    assert.equal(page.locationInput, LD.storeNameTwo);
    let ticket = this.store.find('ticket', TD.idOne);
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
  fillIn(PS_SEARCH, 'GHI789');
  andThen(() => {
    assert.equal(page.locationInput, LD.storeNameTwo);
    assert.equal(page.locationOptionLength, 1);
    assert.equal(find(`${POWER_SELECT_OPTIONS} > li:eq(0)`).text().trim(), LD.storeNameThree);
  });
  page.locationClickIdThree();
  andThen(() => {
    assert.equal(page.locationInput, LD.storeNameThree);
    let ticket = this.store.find('ticket', TD.idOne);
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
    assert.ok(urlContains(currentURL(), TICKET_LIST_URL));
  });
});

//*TICKET TO ASSIGNEE*/
test('assignee component shows assignee for ticket and will fire off xhr to fetch assignees on search to change assignee', async function(assert) {
  await page.visitDetail();
  assert.equal(page.assigneeInput, PD.fullname);
  let ticket = this.store.find('ticket', TD.idOne);
  assert.equal(ticket.get('assignee.id'), PD.idOne);
  assert.equal(ticket.get('assignee_fk'), PD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  xhr(`${PEOPLE_URL}person__icontains=b/`, 'GET', null, {}, 200, PF.search_power_select());
  await selectSearch(TICKET_ASSIGNEE, 'b');
  assert.equal(page.assigneeInput, PD.fullname);
  assert.equal(page.assigneeOptionLength, 10);
  assert.equal(find(`${POWER_SELECT_OPTIONS} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
  await page.assigneeClickOptionOne();
  assert.equal(page.assigneeInput, `${PD.nameBoy} ${PD.lastNameBoy}`);
  await selectSearch(TICKET_ASSIGNEE, '');
  assert.equal(page.assigneeOptionLength, 1);
  assert.equal(page.assigneeInput, `${PD.nameBoy} ${PD.lastNameBoy}`);
  await selectSearch(TICKET_ASSIGNEE, 'b');
  assert.equal(page.assigneeInput, `${PD.nameBoy} ${PD.lastNameBoy}`);
  assert.equal(page.assigneeOptionLength, 10);
  assert.equal(find(`${POWER_SELECT_OPTIONS} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
  await page.assigneeClickOptionTwo();
  assert.equal(page.assigneeInput, `${PD.nameBoy2} ${PD.lastNameBoy2}`);
  ticket = this.store.find('ticket', TD.idOne);
  assert.equal(ticket.get('assignee.id'), PD.idSearch);
  assert.equal(ticket.get('assignee_fk'), PD.idOne);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  //ensure categories has not changed
  assert.equal(ticket.get('top_level_category').get('id'), CD.idOne);
  assert.equal(ticket.get('categories').get('length'), 3);
  //search specific assignee
  xhr(`${PEOPLE_URL}person__icontains=Boy1/`, 'GET', null, {}, 200, PF.search_power_select());
  await selectSearch(TICKET_ASSIGNEE, 'Boy1');
  assert.equal(page.assigneeInput, `${PD.nameBoy2} ${PD.lastNameBoy2}`);
  assert.equal(page.assigneeOptionLength, 10);
  assert.equal(find(`${POWER_SELECT_OPTIONS} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
  await page.assigneeClickOptionOne();
  assert.equal(page.assigneeInput, `${PD.nameBoy} ${PD.lastNameBoy}`);
  ticket = this.store.find('ticket', TD.idOne);
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
  assert.ok(urlContains(currentURL(), TICKET_LIST_URL));
});

test('clicking and typing into db-fetch power select for people will not fire xhr if spacebar pressed', async function(assert) {
  await page.visitDetail();
  await selectSearch(TICKET_ASSIGNEE, ' ');
  assert.equal(page.assigneeOptionLength, 1);
  assert.equal(find(`${POWER_SELECT_OPTIONS} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
});

/* OTHER */
test('textarea autoresize working for the request field', async function(assert) {
  await page.visit();
  assert.equal(currentURL(), TICKET_LIST_URL);
  await click('.t-grid-data:eq(0)');
  assert.equal(currentURL(), DETAIL_URL);
  let o_height = find('.t-ticket-request-single').innerHeight();
  page.requestFillIn('this\nthat\nthis\nthat\nthis\n');
  andThen(() => {
    waitFor(assert, () => {
      let n_height = find('.t-ticket-request-single').innerHeight();
      assert.ok(n_height > o_height);
    });
  });
});

test('making a ticket dirty causes the dirty indicator do show in the grid', async function(assert) {
  await page.visit();
  assert.equal(currentURL(), TICKET_LIST_URL);
  assert.equal(find('.t-grid-data:eq(0) .dirty').length, 0);
  await click('.t-grid-data:eq(0)');
  let ticket = this.store.find('ticket', TD.idOne);
  assert.equal(currentURL(), DETAIL_URL);
  page.requestFillIn('this\nthat\nthis\nthat\nthis\n');
  await page.visit();
  assert.equal(currentURL(), TICKET_LIST_URL);
  assert.equal(find('.t-grid-data:eq(0) .dirty').length, 1);
});

/* UPDATE BUTTON */
test('clicking update with no changes will not fire off xhr', async function(assert) {
  await page.visitDetail();
  await page.update();
  assert.equal(currentURL(), DETAIL_URL);
});

test('clicking update will not transition away from ticket detail and bring in latest activities in correct order', async function(assert) {
  let iso;
  await page.visitDetail();
  const date = new Date();
  date.setMonth(date.getMonth()-1);
  iso = date.toISOString();
  run(() => {
    this.store.push('ticket', {id: TD.idOne, created: iso});
  })
  assert.equal(find('.t-ticket-comment').attr('placeholder'), 'Enter a comment');
  page.commentFillIn(TD.commentOne);
  let response = TF.detail(TD.idOne);
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_with_comment), {}, 200, response);
  let json = TA_FIXTURES.assignee_only();
  //Prevent setting read only properties
  const d = new Date();
  json.results[1].created = d.setDate(d.getDate()-90);
  json.results[1].person.fullname = 'Im second';

  const activity_response = json;
  ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, activity_response);
  await page.update();
  assert.equal(currentURL(), DETAIL_URL);
  let ticket = this.store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('comment'), '');
  assert.equal(ticket.get('created'), iso);
  assert.equal(page.activityTwoPerson, 'Im second');
  let activity = this.store.find('activity');
  assert.equal(activity.get('length'), 2);
});

skip('deep linking with an xhr with a 404 status code will show up in the error component (ticket)', async function(assert) {
  errorSetup();
  clearxhr(detail_xhr);
  const exception = `This record does not exist.`;
  xhr(`${TICKETS_URL}${TD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(find('[data-test-id="ticket-single-error"]').length, 1);
  errorTearDown();
});

test('dt continue button will show up if ticket has a status of draft and can click on it to restart dt', async function(assert) {
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
  const ticket = this.store.find('ticket', TD.idOne);
  assert.notOk(ticket.get('hasSaved'));//prevents PATCH when bail on existing dtd
});

/* jshint ignore:end */
