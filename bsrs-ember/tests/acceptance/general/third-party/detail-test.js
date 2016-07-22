import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import TPF from 'bsrs-ember/vendor/third_party_fixtures';
import TPD from 'bsrs-ember/vendor/defaults/third-party';
import SD from 'bsrs-ember/vendor/defaults/status';
import BASEURLS from 'bsrs-ember/utilities/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/third-party';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_third_parties_url;
const LIST_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + TPD.idOne;

let store, endpoint, endpoint_detail, list_xhr, detail_xhr;

moduleForAcceptance('Acceptance | third-party detail test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    let third_party_list_data = TPF.list();
    let third_party_detail_data = TPF.detail();
    endpoint = PREFIX + BASE_URL + '/';
    endpoint_detail = PREFIX + DETAIL_URL + '/';
    list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, third_party_list_data);
    detail_xhr = xhr(endpoint_detail, 'GET', null, {}, 200, third_party_detail_data);
  },
});

test('clicking on a third party name will redirect them to the detail view', (assert) => {
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
});

test('visiting admin/third-parties detail and update all fields on the record', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let third_party = store.find('third-party').objectAt(0);
    assert.ok(third_party.get('isNotDirty'));
    assert.equal(find('.t-third-party-name').val(), TPD.nameOne);
    assert.equal(find('.t-third-party-number').val(), TPD.numberOne);
    assert.equal(page.statusInput, t(SD.activeName));
  });
  let response = TPF.detail(TPD.idOne);
  let payload = TPF.put({
    name: TPD.nameTwo,
    number: TPD.numberTwo,
    status: TPD.statusInactive
  });
  fillIn('.t-third-party-name', TPD.nameTwo);
  fillIn('.t-third-party-number', TPD.numberTwo);
  page.statusClickDropdown();
  page.statusClickOptionTwo();
  andThen(() => {
    let third_party = store.find('third-party', TPD.idOne);
    assert.ok(third_party.get('isDirty'));
  });
  xhr(endpoint_detail, 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    let third_party = store.find('third-party', TPD.idOne);
    assert.ok(third_party.get('isNotDirty'));
  });
});

test('admin/third-parties detail: when editing name to invalid, it checks for validation', (assert) => {
  page.visitDetail();
  fillIn('.t-third-party-name', '');
  fillIn('.t-third-party-number', '');
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-name-validation-error').text().trim(), 'Invalid Name');
    assert.equal(find('.t-number-validation-error').text().trim(), 'Invalid Number');
  });
  fillIn('.t-third-party-name', TPD.nameTwo);
  fillIn('.t-third-party-number', TPD.numberTwo);
  page.statusClickDropdown();
  page.statusClickOptionTwo();
  let response = TPF.detail(TPD.idOne);
  let payload = TPF.put({
    name: TPD.nameTwo,
    number: TPD.numberTwo,
    status: TPD.statusInactive
  });
  xhr(endpoint_detail, 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    let third_party = store.find('third-party', TPD.idOne);
    assert.ok(third_party.get('isNotDirty'));
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
  clearxhr(list_xhr);
  page.visitDetail();
  fillIn('.t-third-party-name', TPD.nameTwo);
  andThen(() => {
    let third_party = store.find('third-party', TPD.idOne);
    assert.ok(third_party.get('isDirty'));
  });
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
      assert.equal(find('.t-third-party-name').val(), TPD.nameTwo);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  page.visitDetail();
  fillIn('.t-third-party-name', TPD.nameTwo);
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
      assert.equal(currentURL(), LIST_URL);
      let third_party = store.find('third-party', TPD.idOne);
      assert.equal(third_party.get('name'), TPD.nameOne);
    });
  });
});

// test('when click delete, third-party is deleted and removed from store', (assert) => {
//     visit(DETAIL_URL);
//     var delete_url = PREFIX + BASE_URL + '/' + TPD.idOne + '/';
//     xhr(delete_url, 'DELETE', null, {}, 204, {});
//     generalPage.delete();
//     andThen(() => {
//         assert.equal(currentURL(), LIST_URL);
//         assert.equal(store.find('third-party', TPD.idOne).get('length'), undefined);
//     });
// });

/* STATUS */
test('can change status to inactive for person and save (power select)', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(page.statusInput, t(SD.activeName));
  });
  page.statusClickDropdown();
  andThen(() => {
    assert.equal(page.statusOptionLength, 3);
    assert.equal(page.statusOne, t(SD.activeName));
    assert.equal(page.statusTwo, t(SD.inactiveName));
    assert.equal(page.statusThree, t(SD.expiredName));
    const person = store.find('third-party', TPD.idOne);
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  });
  page.statusClickOptionTwo();
  andThen(() => {
    const person = store.find('third-party', TPD.idOne);
    assert.equal(person.get('status_fk'), SD.activeId);
    assert.equal(person.get('status.id'), SD.inactiveId);
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    assert.equal(page.statusInput, t(SD.inactiveName));
  });
  let url = PREFIX + DETAIL_URL + '/';
  let payload = TPF.put({id: TPD.idOne, status: SD.inactiveId});
  xhr(url, 'PUT', JSON.stringify(payload), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
});

test('deep linking with an xhr with a 404 status code will show up in the error component (tp)', (assert) => {
  clearxhr(detail_xhr);
  clearxhr(list_xhr);
  const exception = `This record does not exist.`;
  xhr(`${endpoint}${TPD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-error-message').text(), 'WAT');
  });
});
