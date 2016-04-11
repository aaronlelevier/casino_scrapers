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
import { dtd_payload, dtd_payload_two, dtd_payload_link_two_put, dtd_payload_update_priority, dtd_payload_no_priority, dtd_new_payload, dtd_payload_with_categories } from 'bsrs-ember/tests/helpers/payloads/dtd';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import LINK from 'bsrs-ember/vendor/defaults/link';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/category';
import CF from 'bsrs-ember/vendor/category_fixtures';
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

test('add, cancel, no modal - because fields have not data', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(page.fieldLabelCount, 1);
  });
  page.addFieldBtn();
  andThen(() => {
    assert.equal(page.fieldLabelCount, 2);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  andThen(() => {
    assert.equal(page.fieldLabelCount, 1);
  });
});

test('add, remove, cancel, not modal - because fields have not data', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(page.fieldLabelCount, 1);
  });
  page.addFieldBtn();
  andThen(() => {
    assert.equal(page.fieldLabelCount, 2);
  });
  page.fieldTwoDelete();
  andThen(() => {
    assert.equal(page.fieldLabelCount, 1);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  andThen(() => {
    assert.equal(page.fieldLabelCount, 1);
  });
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
  andThen(() => {
    assert.equal(page.fieldLabelCount, 1);
  });
});

/* jshint ignore:start */
test('when click delete, modal displays and when click ok, dtd is deleted and removed from store', async assert => {
  await visit(DETAIL_URL);
  await generalPage.delete();
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.deleteModalIsVisible);
      assert.equal(find('.t-modal-delete-body').text().trim(), t('crud.delete.confirm'));
    });
  });
  xhr(`${PREFIX}${BASE_URL}/${DTD.idOne}/`, 'DELETE', null, {}, 204, {});
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DTD_URL);
      assert.equal(store.find('dtd', DTD.idOne).get('length'), undefined);
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
  await page.clickAddLinkBtn();
  assert.equal(page.textCount, 2);
  const json = { 'results': [{id: DTD.idOne, key: DTD.keyOne}, {id: DTD.idTwo, key: DTD.keyTwo}] };
  ajax(`/api/dtds/?key__icontains=1`, 'GET', null, {}, 200, json);
  await page
  .requestFillIn_two(LINK.requestTwo)
  .textFillIn_two(LINK.textTwo)
  .action_buttonClick_two()
  .destinationClickDropdownOne()
  .destinationSearch('1')
  .destinationClickOptionOne();
  xhr(DT_PUT_URL, 'PUT', JSON.stringify(dtd_payload_link_two_put), {}, 200, {});
  await generalPage.save();
  assert.equal(currentURL(), DETAIL_URL);
});

/* CATEGORIES */
test('categories selector is wired up and working', async assert => {
  await page.visitDetail();
  const top_level_categories_endpoint = PREFIX + '/admin/categories/parents/';
  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  await ticketPage
    .categoryOneClickDropdown()
    .categoryOneClickOptionOne();
  assert.equal(ticketPage.categoryOneInput, CD.nameOne);
  const second_level_categories_endpoint = PREFIX + `/admin/categories/?parent=${CD.idOne}`;
  xhr(second_level_categories_endpoint, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [], CD.idOne, 1));
  await ticketPage
    .categoryTwoClickDropdown()
    .categoryTwoClickOptionOne();
  assert.equal(ticketPage.categoryTwoInput, CD.nameTwo);
  xhr(DT_PUT_URL, 'PUT', JSON.stringify(dtd_payload_with_categories), {}, 200, {});
  await generalPage.save();
  assert.equal(currentURL(), DETAIL_URL);
});

// test('categories are in order based on text', async assert => {
//   clearxhr(list_xhr);
//   await page.visitDetail();
//   assert.equal(page.categoryOneInput, CD.nameOne);
//   assert.equal(page.categoryTwoInput, CD.nameRepairChild);
//   assert.equal(page.categoryThreeInput, CD.namePlumbingChild);
// });

//test('power select options are rendered immediately when enter detail route and can save different top level category', (assert) => {
//  let top_level_data = CF.top_level();
//  top_level_data.results[1] = {id: CD.idThree, name: CD.nameThree, parent_id: null, children: [{id: CD.idLossPreventionChild, name: CD.nameLossPreventionChild}], level: 0};
//  page.visitDetail();
//  andThen(() => {
//    let components = page.powerSelectComponents;
//    assert.equal(components, 3);
//    let dtd = store.find('dtd', DTD.idOne);
//    assert.equal(dtd.get('top_level_category').get('id'), CD.idOne);
//    assert.equal(dtd.get('categories').get('length'), 3);
//  });
//  let top_level_categories_endpoint = PREFIX + '/admin/categories/parents/';
//  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, top_level_data);
//  page.categoryOneClickDropdown();
//  andThen(() => {
//    assert.equal(page.categoryOneInput, CD.nameOne);
//    assert.equal(page.categoryOneOptionLength, 2);
//  });
//  page.categoryOneClickDropdown();
//  ajax(`${PREFIX}/admin/categories/?parent=${CD.idOne}`, 'GET', null, {}, 200, CF.get(CD.idTwo, CD.nameTwo));
//  page.categoryTwoClickDropdown();
//  andThen(() => {
//    assert.equal(page.categoryTwoInput, CD.nameRepairChild);
//  });
//  page.categoryTwoClickDropdown();
//  ajax(`${PREFIX}/admin/categories/?parent=${CD.idPlumbing}`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbing, CD.nameRepairChild));
//  page.categoryThreeClickDropdown();
//  andThen(() => {
//    assert.equal(page.categoryThreeInput, CD.namePlumbingChild);
//    assert.equal(page.categoryThreeOptionLength, 1);
//  });
//  page.categoryThreeClickDropdown();
//  //click loss prevention
//  page.categoryOneClickDropdown();
//  page.categoryOneClickOptionTwo();
//  andThen(() => {
//    let components = page.powerSelectComponents;
//    assert.equal(components, 2);
//    let dtd = store.find('dtd', DTD.idOne);
//    assert.equal(dtd.get('top_level_category').get('id'), CD.idThree);
//    assert.equal(dtd.get('model_categories_fks').length, 3);
//    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
//  });
//  page.categoryOneClickDropdown();
//  andThen(() => {
//    assert.equal(page.categoryOneInput, CD.nameThree);
//    assert.equal(page.categoryOneOptionLength, 2);
//  });
//  page.categoryOneClickDropdown();
//  const security = CF.get_list(CD.idLossPreventionChild, CD.nameLossPreventionChild, [], CD.idThree, 1);
//  ajax(`${PREFIX}/admin/categories/?parent=${CD.idThree}`, 'GET', null, {}, 200, security);
//  page.categoryTwoClickDropdown();
//  andThen(() => {
//    assert.equal(page.categoryTwoOptionLength, 1);
//  });
//  page.categoryTwoClickOptionSecurity();
//  andThen(() => {
//    assert.equal(page.categoryTwoInput, CD.nameLossPreventionChild);
//  });
//  const payload = DTDF.put({id: DTD.idOne, categories: [CD.idThree, CD.idLossPreventionChild]});
//  xhr(DDTD_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200);
//  generalPage.save();
//  andThen(() => {
//    assert.equal(currentURL(), DDTD_URL);
//  });
//});

//test('selecting a top level category will alter the url and can cancel/discard changes and return to index', (assert) => {
//  page.visitDetail();
//  andThen(() => {
//    //override electrical to have children
//    store.push('category-children', {id: CCD.idOne, category_pk: CD.idTwo, child_pk: CD.idChild});
//    let cat = store.push('category', {id: CD.idTwo, name: CD.nameTwo, category_children_fks: [CCD.idOne], parent_id: CD.idOne, level: 1});
//    cat.save();
//    let components = page.powerSelectComponents;
//    assert.equal(store.find('category').get('length'), 4);
//    let dtd = store.find('dtd', DTD.idOne);
//    assert.equal(dtd.get('categories').get('length'), 3);
//    // assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
//    // assert.ok(dtd.get('categoriesIsNotDirty'));
//    assert.equal(components, 3);
//  });
//  // select same
//  let top_level_categories_endpoint = PREFIX + '/admin/categories/parents/';
//  top_level_xhr = xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
//  page.categoryOneClickDropdown();
//  page.categoryOneClickOptionOne();
//  andThen(() => {
//    let components = page.powerSelectComponents;
//    assert.equal(store.find('dtd').get('length'), 1);
//    let dtd = store.find('dtd', DTD.idOne);
//    assert.equal(dtd.get('categories').get('length'), 3);
//    assert.equal(dtd.get('sorted_categories').get('length'), 3);
//    assert.equal(dtd.get('sorted_categories').objectAt(0).get('children').get('length'), 2);
//    assert.equal(dtd.get('sorted_categories').objectAt(1).get('children').get('length'), 1);
//    assert.equal(dtd.get('sorted_categories').objectAt(2).get('children').get('length'), 0);
//    // assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
//    // assert.ok(dtd.get('categoriesIsNotDirty'));
//    assert.equal(components, 3);
//  });
//  //select electrical from second level
//  ajax(`${PREFIX}/admin/categories/?parent=${CD.idOne}`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id:CD.idChild}], CD.idOne, 1));
//  page.categoryTwoClickDropdown();
//  page.categoryTwoClickOptionElectrical();
//  andThen(() => {
//    let components = page.powerSelectComponents;
//    let dtd = store.find('dtd', DTD.idOne);
//    assert.equal(store.find('category').get('length'), 5);
//    assert.equal(dtd.get('categories').get('length'), 2);
//    assert.equal(dtd.get('sorted_categories').get('length'), 2);
//    assert.equal(dtd.get('sorted_categories').objectAt(0).get('children').get('length'), 2);
//    // assert.equal(dtd.get('sorted_categories').objectAt(1).get('children').get('length'), 1);
//    // assert.ok(dtd.get('isDirtyOrRelatedDirty'));
//    // assert.ok(dtd.get('categoriesIsDirty'));
//    assert.equal(components, 3);
//  });
//  const payload = CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2);
//  ajax(`${PREFIX}/admin/categories/?parent=${CD.idTwo}`, 'GET', null, {}, 200, payload);
//  page.categoryThreeClickDropdown();
//  page.categoryThreeClickOptionOne();
//  generalPage.cancel();
//  andThen(() => {
//    waitFor(() => {
//      assert.equal(currentURL(), DETAIL_URL);
//      assert.ok(generalPage.modalIsVisible);
//      assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
//    });
//  });
//  generalPage.clickModalCancel();
//  andThen(() => {
//    waitFor(() => {
//      assert.equal(currentURL(), DETAIL_URL);
//      assert.ok(generalPage.modalIsHidden);
//      let components = page.powerSelectComponents;
//      let dtds = store.find('dtd');
//      assert.equal(store.find('category').get('length'), 5);
//      assert.equal(dtds.get('length'), 1);
//      let dtd = store.find('dtd', DTD.idOne);
//      assert.equal(dtd.get('categories').get('length'), 3);
//      assert.equal(dtd.get('sorted_categories').objectAt(0).get('children').get('length'), 2);
//      assert.equal(dtd.get('sorted_categories').objectAt(1).get('children').get('length'), 1);
//      assert.equal(dtd.get('sorted_categories').objectAt(2).get('children').get('length'), 0);
//      // assert.ok(dtd.get('isDirtyOrRelatedDirty'));
//      // assert.ok(dtd.get('categoriesIsDirty'));
//      assert.equal(components, 3);
//    });
//  });
//  generalPage.cancel();
//  andThen(() => {
//    waitFor(() => {
//      assert.equal(currentURL(), DETAIL_URL);
//      assert.ok(generalPage.modalIsVisible);
//      assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
//    });
//  });
//  generalPage.clickModalRollback();
//  andThen(() => {
//    waitFor(() => {
//      assert.equal(currentURL(), DDTD_URL);
//    });
//  });
//});

//test('changing tree and reverting tree should not show as dirty', (assert) => {
//  let top_level_categories_endpoint = PREFIX + '/admin/categories/parents/';
//  top_level_xhr = xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
//  clearxhr(list_xhr);
//  page.visitDetail();
//  andThen(() => {
//    //override electrical to have children
//    store.push('category-children', {id: CCD.idOne, category_pk: CD.idTwo, child_pk: CD.idChild});
//    let cat = store.push('category', {id: CD.idTwo, name: CD.nameTwo, category_children_fks: [CCD.idOne], parent_id: CD.idOne, level: 1});
//    cat.save();
//    let dtd = store.find('dtd', DTD.idOne);
//    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
//    assert.ok(dtd.get('categoriesIsNotDirty'));
//  });
//  //select same
//  page.categoryOneClickDropdown();
//  page.categoryOneClickOptionOne();
//  andThen(() => {
//    let components = page.powerSelectComponents;
//    let dtd = store.find('dtd', DTD.idOne);
//    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
//    assert.ok(dtd.get('categoriesIsNotDirty'));
//  });
//  //select electrical from second level
//  ajax(`${PREFIX}/admin/categories/?parent=${CD.idOne}`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
//  page.categoryTwoClickDropdown();
//  page.categoryTwoClickOptionElectrical();
//  andThen(() => {
//    let dtd = store.find('dtd', DTD.idOne);
//    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
//    assert.ok(dtd.get('categoriesIsDirty'));
//  });
//  ajax(`${PREFIX}/admin/categories/?parent=${CD.idTwo}`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
//  page.categoryThreeClickDropdown();
//  page.categoryThreeClickOptionOne();
//  andThen(() => {
//    let dtd = store.find('dtd', DTD.idOne);
//    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
//    assert.ok(dtd.get('categoriesIsDirty'));
//  });
//  ajax(`${PREFIX}/admin/categories/?parent=${CD.idOne}`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbing, CD.nameRepairChild, [{id:CD.idPlumbingChild}], CD.idOne, 1));
//  page.categoryTwoClickDropdown();
//  page.categoryTwoClickOptionPlumbing();
//  andThen(() => {
//    let dtd = store.find('dtd', DTD.idOne);
//    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
//    assert.ok(dtd.get('categoriesIsDirty'));
//  });
//  ajax(`${PREFIX}/admin/categories/?parent=${CD.idPlumbing}`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbingChild, CD.namePlumbingChild, [], CD.idPlumbing, 2));
//  page.categoryThreeClickDropdown();
//  //reset tree back to original
//  page.categoryThreeClickOptionToilet();
//  andThen(() => {
//    let dtd = store.find('dtd', DTD.idOne);
//    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
//    assert.ok(dtd.get('categoriesIsNotDirty'));
//  });
//});

//test('selecting and removing a top level category will remove children categories already selected', (assert) => {
//  let top_level_categories_endpoint = PREFIX + '/admin/categories/parents/';
//  top_level_xhr = xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
//  clearxhr(list_xhr);
//  page.visitDetail();
//  andThen(() => {
//    let components = page.powerSelectComponents;
//    assert.equal(store.find('category').get('length'), 4);
//    let dtds = store.find('dtd');
//  });
//  //change top level
//  page.categoryOneClickDropdown();
//  page.categoryOneClickOptionTwo();
//  andThen(() => {
//    let components = page.powerSelectComponents;
//    let dtds = store.find('dtd');
//    assert.equal(dtds.get('length'), 1);
//    assert.equal(dtds.objectAt(0).get('categories').get('length'), 1);
//    assert.equal(dtds.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 0);
//    assert.equal(components, 1);
//  });
//});

//test('when selecting a new parent category it should remove previously selected child category but if select same, it wont clear tree', (assert) => {
//  page.visitDetail();
//  ajax(`${PREFIX}/admin/categories/?parent=${CD.idOne}`, 'GET', null, {}, 200, CF.get_list(CD.idPlumbing, CD.nameRepairChild, [{id: CD.idChild}], CD.idOne, 1));
//  page.categoryTwoClickDropdown();
//  page.categoryTwoClickOptionPlumbing();
//  andThen(() => {
//    let dtd = store.findOne('dtd');
//    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
//    assert.equal(dtd.get('categories').get('length'), 3);
//    let components = page.powerSelectComponents;
//    assert.equal(components, 3);
//  });
//  ajax(`${PREFIX}/admin/categories/?parent=${CD.idOne}`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
//  page.categoryTwoClickDropdown();
//  page.categoryTwoClickOptionElectrical();
//  andThen(() => {
//    let dtd = store.findOne('dtd');
//    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
//    assert.equal(dtd.get('categories').get('length'), 2);
//    let components = page.powerSelectComponents;
//    assert.equal(components, 3);
//  });
//  let top_level_categories_endpoint = PREFIX + '/admin/categories/parents/';
//  top_level_xhr = xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
//  page.categoryOneClickDropdown();
//  page.categoryOneClickOptionTwo();
//  andThen(() => {
//    let dtd = store.findOne('dtd');
//    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
//    assert.equal(dtd.get('categories').get('length'), 1);
//    let components = page.powerSelectComponents;
//    assert.equal(components, 1);
//  });
//  page.categoryOneClickDropdown();
//  page.categoryOneClickOptionOne();
//  ajax(`${PREFIX}/admin/categories/?parent=${CD.idTwo}`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
//  page.categoryTwoClickDropdown();
//  page.categoryTwoClickOptionOne();
//  page.categoryThreeClickDropdown();
//  page.categoryThreeClickOptionOne();
//  let payload = dtd_payload_detail;
//  payload.categories = [CD.idOne, CD.idTwo , CD.idChild];
//  xhr(DDTD_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
//  generalPage.save();
//  andThen(() => {
//    assert.equal(currentURL(), DDTD_URL);
//  });
//});
/* jshint ignore:end */
