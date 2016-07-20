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
import { dtd_payload, dtd_payload_two, dtd_payload_link_two_put, dtd_payload_update_priority, dtd_payload_no_priority, dtd_new_payload,
  dtd_payload_with_categories, dtd_payload_change_categories, dtd_payload_no_status } from 'bsrs-ember/tests/helpers/payloads/dtd';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import LINK from 'bsrs-ember/vendor/defaults/link';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/category';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CCD from 'bsrs-ember/vendor/defaults/category-children';
import BASEURLS from 'bsrs-ember/utilities/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/dtd';
import generalPage from 'bsrs-ember/tests/pages/general';
import ticketPage from 'bsrs-ember/tests/pages/tickets';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_dtd_url;
const DTD_URL = `${BASE_URL}`;
const DETAIL_URL = `${BASE_URL}/${DTD.idOne}`;
const DTD_PUT_URL = `${PREFIX}${DETAIL_URL}/`;
const BACKSPACE = {keyCode: 8};
const DTD_ERROR_URL = BASEURLS.dtd_error_url;
const PAGE_SIZE = config.APP.PAGE_SIZE;

let application, store, endpoint, list_xhr, detail_xhr, detail_data;

moduleForAcceptance('Acceptance | dtd detail', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    endpoint = `${PREFIX}${BASE_URL}/`;
    list_xhr = xhr(`${endpoint}?page=1`, 'GET', null, {}, 200, DTDF.list());
    detail_data = DTDF.detail(DTD.idOne);
    detail_xhr = xhr(`${endpoint}${DTD.idOne}/`, 'GET', null, {}, 200, detail_data);
  },
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
  xhr(DTD_PUT_URL, 'PUT', JSON.stringify(dtd_payload_update_priority), {}, 200, {});
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
  .linkTypeTwoClick();
  page.noteTypeClickDropdown()
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
  xhr(DTD_PUT_URL, 'PUT', JSON.stringify(dtd_payload_two), {}, 200, {});
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
  const new_dtd_payload = Ember.$.extend(true, {}, dtd_payload);
  new_dtd_payload['fields'].push({
    id: 1,
    label: FD.labelOne,
    type: FD.typeFour,
    required: true,
    order: FD.orderTwo,
    options: [{id: 1, text: OD.textOne, order: 0}]
  });
  xhr(DTD_PUT_URL, 'PUT', JSON.stringify(new_dtd_payload), {}, 200, {});
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
  page.removePriority();
  andThen(() => {
    assert.equal(ticketPage.priorityInput.split(' ')[0], '');
  });
  xhr(DTD_PUT_URL, 'PUT', JSON.stringify(dtd_payload_no_priority), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('dtd can clear out link status', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(ticketPage.statusInput.split(' ')[0], TD.statusOne);
  });
  page.removeStatus();
  andThen(() => {
    assert.equal(ticketPage.statusInput.split(' ')[0], '');
  });
  xhr(DTD_PUT_URL, 'PUT', JSON.stringify(dtd_payload_no_status), {}, 200, {});
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
    });
  });
});

test('click modal rollback (dtd)', (assert) => {
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
      assert.equal(currentURL(), DETAIL_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('clicking cancel button will stay on detail view', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(),DETAIL_URL);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('altering the page size will not push in models over top of dirty ones', assert => {
  page.visitDetail();
  page.descriptionFillIn(DTD.descriptionTwo);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-dtd-single-description').val(), DTD.descriptionTwo);
  });
  const updated_pg_size = PAGE_SIZE*2;
  let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
  xhr(option_one, 'GET',null,{},200,DTDF.paginated(updated_pg_size));
  alterPageSize('.t-page-size', updated_pg_size);
  andThen(() => {
    assert.equal(currentURL(),`${DETAIL_URL}?page_size=${updated_pg_size}`);
    assert.equal(find('.t-grid-data').length, updated_pg_size-1);
    assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
    assert.equal(find('.t-tab-close > i.dirty').length, 1);
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  page.visitDetail();
  ticketPage.priorityClickDropdown();
  ticketPage.priorityClickOptionTwo();
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
      assert.equal(currentURL(), DETAIL_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

/* jshint ignore:start */
test('add field, cancel, no modal', async assert => {
  await page.visitDetail();
  assert.equal(page.fieldLabelCount, 1);
  await page.addFieldBtn();
  assert.equal(page.fieldLabelCount, 2);
  await generalPage.cancel();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(page.fieldLabelCount, 1);
});

test('add link, remove, cancel', async assert => {
  await page.visitDetail();
  assert.equal(page.linkTextLength, 1);
  await page.addLinkBtn();
  assert.equal(page.linkTextLength, 2);
  await generalPage.cancel();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(page.linkTextLength, 1);
});

test('remove existing, cancel, modal - should be prompted when removing existing because has data', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(page.fieldLabelCount, 1);
  });
  page.fieldOneDelete();
  andThen(() => {
    assert.equal(page.fieldLabelCount, 0);
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
      assert.equal(currentURL(), DETAIL_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
  andThen(() => {
    assert.equal(page.fieldLabelCount, 1);
  });
});

test('when click delete, modal displays and when click ok, dtd is deleted and removed from store', async assert => {
  await visit(DETAIL_URL);
  await generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'dtd'}));
      assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
    });
  });
  xhr(`${PREFIX}${BASE_URL}/${DTD.idOne}/`, 'DELETE', null, {}, 204, {});
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DTD_URL);
      assert.equal(store.find('dtd', DTD.idOne).get('length'), undefined);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('deep linking with an xhr with a 404 status code will show up in the error component (dtd)', async assert => {
  clearxhr(detail_xhr);
  const exception = `This record does not exist.`;
  xhr(`${endpoint}${DTD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  await page.visitDetail();
  assert.equal(currentURL(), DTD_ERROR_URL);
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(find('.t-error-message').text(), 'WAT');
});

test('click add-link, and fill in', async assert => {
  random.uuid = function() { return UUID.value; };
  await page.visitDetail();
  assert.ok(find('.t-dtd-link-action_button').prop('checked'));
  assert.equal(page.textCount, 1);
  await page.addLinkBtn();
  assert.equal(page.textCount, 2);
  const json = { 'results': [{id: DTD.idOne, key: DTD.keyOne}, {id: DTD.idTwo, key: DTD.keyTwo}] };
  ajax(`/api/dtds/?search=1`, 'GET', null, {}, 200, json);
  await page
  .requestFillIn_two(LINK.requestTwo)
  .textFillIn_two(LINK.textTwo)
  .action_buttonClick_two()
  .destinationClickDropdownOne()
  .destinationSearch('1')
  .destinationClickOptionOne();
  xhr(DTD_PUT_URL, 'PUT', JSON.stringify(dtd_payload_link_two_put), {}, 200, {});
  await generalPage.save();
  assert.equal(currentURL(), DETAIL_URL);
});

/*  */
test('categories selector is wired up and working', async assert => {
  await page.visitDetail();
  const top_level_categories_endpoint = PREFIX + '/admin/categories/parents/';
  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  await ticketPage
  .categoryOneClickDropdown()
  .categoryOneClickOptionOne();
  assert.equal(ticketPage.categoryOneInput.split(/\s/)[0], CD.nameOne);
  const second_level_categories_endpoint = PREFIX + `/admin/categories/?parent=${CD.idOne}&page_size=1000`;
  xhr(second_level_categories_endpoint, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [], CD.idOne, 1));
  await ticketPage
  .categoryTwoClickDropdown()
  .categoryTwoClickOptionOne();
  assert.equal(ticketPage.categoryTwoInput.split(/\s/)[0], CD.nameTwo);
  xhr(DTD_PUT_URL, 'PUT', JSON.stringify(dtd_payload_with_categories), {}, 200, {});
  await generalPage.save();
  assert.equal(currentURL(), DETAIL_URL);
});

test('categories are in order based on text', async assert => {
  await page.visitDetail();
  assert.equal(ticketPage.categoryOneInput.split(/\s/)[0], CD.nameOne);
  assert.equal(ticketPage.categoryTwoInput.split(/\s/)[0], CD.nameRepairChild);
  assert.equal(`${ticketPage.categoryThreeInput.split(/\s/)[0]} ${ticketPage.categoryThreeInput.split(/\s/)[1]}`, CD.namePlumbingChild);
});

test('power select options are rendered immediately when enter detail route and can save different top level category', async assert => {
  await page.visitDetail();
  let components = ticketPage.powerSelectComponents;
  assert.equal(components, 3);
  let dtd = store.find('dtd', DTD.idOne);
  let link = store.find('link', dtd.get('links').objectAt(0).get('id'));
  assert.equal(link.get('top_level_category').get('id'), CD.idOne);
  assert.equal(link.get('categories').get('length'), 3);
  let top_level_data = CF.top_level();
  top_level_data.results[1] = {id: CD.idThree, name: CD.nameThree, parent_id: null, children: [{id: CD.idLossPreventionChild, name: CD.nameLossPreventionChild}], level: 0};
  let top_level_categories_endpoint = PREFIX + '/admin/categories/parents/';
  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, top_level_data);
  await ticketPage.categoryOneClickDropdown();
  assert.equal(ticketPage.categoryOneInput.split(/\s/)[0], CD.nameOne);
  assert.equal(ticketPage.categoryOneOptionLength, 2);
  await ticketPage.categoryOneClickDropdown();
  ajax(`${PREFIX}/admin/categories/?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get(CD.idTwo, CD.nameTwo));
  await ticketPage.categoryTwoClickDropdown();
  assert.equal(ticketPage.categoryTwoInput.split(/\s/)[0], CD.nameRepairChild);
  ticketPage.categoryTwoClickDropdown();
  ajax(`${PREFIX}/admin/categories/?parent=${CD.idPlumbing}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbing, CD.nameRepairChild));
  await ticketPage.categoryThreeClickDropdown();
  assert.equal(`${ticketPage.categoryThreeInput.split(/\s/)[0]} ${ticketPage.categoryThreeInput.split(/\s/)[1]}`, CD.namePlumbingChild);
  assert.equal(ticketPage.categoryThreeOptionLength, 1);
  await ticketPage.categoryThreeClickDropdown();
  //click loss prevention
  await ticketPage.categoryOneClickDropdown();
  await ticketPage.categoryOneClickOptionTwo();
  components = ticketPage.powerSelectComponents;
  assert.equal(components, 2);
  assert.equal(link.get('top_level_category').get('id'), CD.idThree);
  assert.equal(link.get('model_categories_fks').length, 3);
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  await ticketPage.categoryOneClickDropdown();
  assert.equal(`${ticketPage.categoryOneInput.split(/\s/)[0]} ${ticketPage.categoryOneInput.split(/\s/)[1]}`, CD.nameThree);
  assert.equal(ticketPage.categoryOneOptionLength, 2);
  await ticketPage.categoryOneClickDropdown();
  const security = CF.get_list(CD.idLossPreventionChild, CD.nameLossPreventionChild, [], CD.idThree, 1);
  ajax(`${PREFIX}/admin/categories/?parent=${CD.idThree}&page_size=1000`, 'GET', null, {}, 200, security);
  await ticketPage.categoryTwoClickDropdown();
  assert.equal(ticketPage.categoryTwoOptionLength, 1);
  await ticketPage.categoryTwoClickOptionSecurity();
  assert.equal(ticketPage.categoryTwoInput.split(/\s/)[0], CD.nameLossPreventionChild);
  xhr(DTD_PUT_URL, 'PUT', JSON.stringify(dtd_payload_change_categories), {}, 200);
  await generalPage.save();
  assert.equal(currentURL(), DETAIL_URL);
});

test('selecting a top level category will alter the url and can cancel/discard changes and return to index', async assert => {
  await page.visitDetail();
  let dtd = store.find('dtd', DTD.idOne);
  let link = store.find('link', dtd.get('links').objectAt(0).get('id'));
  //override electrical to have children
  run(() => {
    store.push('category-children', {id: CCD.idOne, category_pk: CD.idTwo, child_pk: CD.idChild});
    let cat = store.push('category', {id: CD.idTwo, name: CD.nameTwo, category_children_fks: [CCD.idOne], parent_id: CD.idOne, level: 1});
    cat.save();
  });
  assert.equal(store.find('category').get('length'), 4);
  assert.equal(link.get('categories').get('length'), 3);
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(link.get('categoriesIsNotDirty'));
  let components = ticketPage.powerSelectComponents;
  assert.equal(components, 3);
  // select same
  let top_level_categories_endpoint = PREFIX + '/admin/categories/parents/';
  top_level_xhr = xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  await ticketPage.categoryOneClickDropdown();
  await ticketPage.categoryOneClickOptionOne();
  assert.equal(store.find('link').get('length'), 1);
  assert.equal(link.get('categories').get('length'), 3);
  assert.equal(link.get('sorted_categories').get('length'), 3);
  assert.equal(link.get('sorted_categories').objectAt(0).get('children').get('length'), 2);
  assert.equal(link.get('sorted_categories').objectAt(1).get('children').get('length'), 1);
  assert.equal(link.get('sorted_categories').objectAt(2).get('children').get('length'), 0);
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(link.get('categoriesIsNotDirty'));
  components = ticketPage.powerSelectComponents;
  assert.equal(components, 3);
  //select electrical from second level
  ajax(`${PREFIX}/admin/categories/?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id:CD.idChild}], CD.idOne, 1));
  await ticketPage.categoryTwoClickDropdown();
  await ticketPage.categoryTwoClickOptionElectrical();
  assert.equal(store.find('category').get('length'), 5);
  assert.equal(link.get('categories').get('length'), 2);
  assert.equal(link.get('sorted_categories').get('length'), 2);
  assert.equal(link.get('sorted_categories').objectAt(0).get('children').get('length'), 2);
  assert.equal(link.get('sorted_categories').objectAt(1).get('children').get('length'), 1);
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  assert.ok(link.get('categoriesIsDirty'));
  components = ticketPage.powerSelectComponents;
  assert.equal(components, 3);
  const payload = CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2);
  ajax(`${PREFIX}/admin/categories/?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, payload);
  await ticketPage.categoryThreeClickDropdown();
  await ticketPage.categoryThreeClickOptionOne();
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
  await generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
      assert.equal(store.find('category').get('length'), 5);
      let dtd = store.find('dtd', DTD.idOne);
      let link = store.find('link', dtd.get('links').objectAt(0).get('id'));
      assert.equal(link.get('categories').get('length'), 3);
      assert.equal(link.get('sorted_categories').objectAt(0).get('children').get('length'), 2);
      assert.equal(link.get('sorted_categories').objectAt(1).get('children').get('length'), 1);
      assert.equal(link.get('sorted_categories').objectAt(2).get('children').get('length'), 0);
      assert.ok(link.get('isDirtyOrRelatedDirty'));
      assert.ok(link.get('categoriesIsDirty'));
      let components = ticketPage.powerSelectComponents;
      assert.equal(components, 3);
    });
  });
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
  await generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.throws(Ember.$('.ember-modal-dialog'));
      assert.equal(currentURL(), DETAIL_URL);
    });
  });
});

test('changing tree and reverting tree should not show as dirty', async assert => {
  await page.visitDetail();
  let dtd = store.find('dtd', DTD.idOne);
  let link = store.find('link', dtd.get('links').objectAt(0).get('id'));
  //override electrical to have children
  run(() => {
    store.push('category-children', {id: CCD.idOne, category_pk: CD.idTwo, child_pk: CD.idChild});
    let cat = store.push('category', {id: CD.idTwo, name: CD.nameTwo, category_children_fks: [CCD.idOne], parent_id: CD.idOne, level: 1});
    cat.save();
  });
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(link.get('categoriesIsNotDirty'));
  //select same
  let top_level_categories_endpoint = PREFIX + '/admin/categories/parents/';
  top_level_xhr = xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  await ticketPage.categoryOneClickDropdown();
  await ticketPage.categoryOneClickOptionOne();
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(link.get('categoriesIsNotDirty'));
  //select electrical from second level
  ajax(`${PREFIX}/admin/categories/?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  await ticketPage.categoryTwoClickDropdown();
  await ticketPage.categoryTwoClickOptionElectrical();
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  assert.ok(link.get('categoriesIsDirty'));
  ajax(`${PREFIX}/admin/categories/?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
  await ticketPage.categoryThreeClickDropdown();
  await ticketPage.categoryThreeClickOptionOne();
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  assert.ok(link.get('categoriesIsDirty'));
  ajax(`${PREFIX}/admin/categories/?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbing, CD.nameRepairChild, [{id:CD.idPlumbingChild}], CD.idOne, 1));
  await ticketPage.categoryTwoClickDropdown();
  await ticketPage.categoryTwoClickOptionPlumbing();
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  assert.ok(link.get('categoriesIsDirty'));
  ajax(`${PREFIX}/admin/categories/?parent=${CD.idPlumbing}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbingChild, CD.namePlumbingChild, [], CD.idPlumbing, 2));
  await ticketPage.categoryThreeClickDropdown();
  //reset tree back to original
  await ticketPage.categoryThreeClickOptionToilet();
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(link.get('categoriesIsNotDirty'));
});

test('selecting and removing a top level category will remove children categories already selected', async assert => {
  await page.visitDetail();
  let dtd = store.find('dtd', DTD.idOne);
  let link = store.find('link', dtd.get('links').objectAt(0).get('id'));
  let components = ticketPage.powerSelectComponents;
  assert.equal(store.find('category').get('length'), 4);
  //change top level
  let top_level_categories_endpoint = PREFIX + '/admin/categories/parents/';
  top_level_xhr = xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  await ticketPage.categoryOneClickDropdown();
  await ticketPage.categoryOneClickOptionTwo();
  components = ticketPage.powerSelectComponents;
  assert.equal(link.get('categories').get('length'), 1);
  assert.equal(link.get('categories').objectAt(0).get('children').get('length'), 0);
  assert.equal(components, 1);
});

test('when selecting a new parent category it should remove previously selected child category but if select same, it wont clear tree', async assert => {
  await page.visitDetail();
  let dtd = store.find('dtd', DTD.idOne);
  let link = store.find('link', dtd.get('links').objectAt(0).get('id'));
  ajax(`${PREFIX}/admin/categories/?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbing, CD.nameRepairChild, [{id: CD.idChild}], CD.idOne, 1));
  await ticketPage.categoryTwoClickDropdown();
  await ticketPage.categoryTwoClickOptionPlumbing();
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(link.get('categories').get('length'), 3);
  let components = ticketPage.powerSelectComponents;
  assert.equal(components, 3);
  ajax(`${PREFIX}/admin/categories/?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  await ticketPage.categoryTwoClickDropdown();
  await ticketPage.categoryTwoClickOptionElectrical();
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  assert.equal(link.get('categories').get('length'), 2);
  components = ticketPage.powerSelectComponents;
  assert.equal(components, 3);
  let top_level_categories_endpoint = PREFIX + '/admin/categories/parents/';
  top_level_xhr = xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  await ticketPage.categoryOneClickDropdown();
  await ticketPage.categoryOneClickOptionTwo();
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  assert.equal(link.get('categories').get('length'), 1);
  components = ticketPage.powerSelectComponents;
  assert.equal(components, 1);
  await ticketPage.categoryOneClickDropdown();
  await ticketPage.categoryOneClickOptionOne();
  ajax(`${PREFIX}/admin/categories/?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
  await ticketPage.categoryTwoClickDropdown();
  await ticketPage.categoryTwoClickOptionOne();
  await ticketPage.categoryThreeClickDropdown();
  await ticketPage.categoryThreeClickOptionOne();
  const payload = dtd_payload_with_categories;
  payload.links[0].categories.push(CD.idChild);
  xhr(DTD_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  await generalPage.save();
  assert.equal(currentURL(), DETAIL_URL);
});

test('can clear out top level category', async assert => {
  await page.visitDetail();
  let dtd = store.find('dtd', DTD.idOne);
  let link = store.find('link', dtd.get('links').objectAt(0).get('id'));
  await page.removeTopLevelCategory();
  let components = ticketPage.powerSelectComponents;
  assert.equal(components, 1);
  assert.equal(link.get('categories.length'), 0);
});

test('can clear out middle category', async assert => {
  await page.visitDetail();
  let dtd = store.find('dtd', DTD.idOne);
  let link = store.find('link', dtd.get('links').objectAt(0).get('id'));
  await page.removeMiddleCategory();
  let components = ticketPage.powerSelectComponents;
  assert.equal(components, 2);
  assert.equal(link.get('categories.length'), 1);
});

test('can clear out leaf category', async assert => {
  await page.visitDetail();
  let dtd = store.find('dtd', DTD.idOne);
  let link = store.find('link', dtd.get('links').objectAt(0).get('id'));
  await page.removeLeafCategory();
  let components = ticketPage.powerSelectComponents;
  assert.equal(components, 3);
  assert.equal(link.get('categories.length'), 2);
});
/*END  */

test('sending a put request with a 400 error will redirect you to the dtd-error page', async assert => {
  await page.visitDetail();
  await ticketPage.priorityClickDropdown()
  .priorityClickOptionTwo();
  const json = { 'results': [{id: DTD.idOne, key: DTD.keyOne}, {id: DTD.idTwo, key: DTD.keyTwo}] };
  const exception = 'Saving this record failed';
  xhr(`${DTD_PUT_URL}`, 'PUT', dtd_payload_update_priority, {}, 400, {'detail': exception});
  await generalPage.save();
  assert.equal(currentURL(), DTD_ERROR_URL);
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(find('.t-error-message').text(), 'WAT');
});

test('clicking on a link will not err out since action return false from dtd controller', async assert => {
  await page.visitDetail();
  click('.t-dtd-preview-btn:eq(0)');
  assert.ok(page.previewButtonOn);
});

/* OTHER */
test('textarea autoresize working for the request field', async assert => {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  let o_height = find('.t-dtd-single-description').innerHeight();
  await fillIn(find('.t-dtd-single-description'), 'this\nthat\nthis\nthat\nthis\n');
  andThen(() => {
    waitFor(assert, () => {
      let n_height = find('.t-dtd-single-description').innerHeight();
      assert.ok(n_height > o_height);
    });
  });
});

/* jshint ignore:end */
