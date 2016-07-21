import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import config from 'bsrs-ember/config/environment';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS from 'bsrs-ember/utilities/urls';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PFD from 'bsrs-ember/vendor/defaults/profile-filter';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PF from 'bsrs-ember/vendor/profile_fixtures';
import PersonF from 'bsrs-ember/vendor/people_fixtures';
import page from 'bsrs-ember/tests/pages/profile';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_profile_url;
const LIST_URL = `${BASE_URL}/index`;
const DETAIL_URL = `${BASE_URL}/${PD.idOne}`;
const API_LIST_URL = `${PREFIX}${BASE_URL}/`;
const API_LIST_URL_PAGE_ONE = `${API_LIST_URL}?page=1`;
const API_DETAIL_URL = `${PREFIX}${BASE_URL}/${PD.idOne}/`;
const API_LIST_URL_PAGE_ONE_PERSON = `${PREFIX}/admin/people/`;

const SEARCH = '.ember-power-select-search input';

var application, store, detailData, detailXhr, listData, listXhr, run = Ember.run;

moduleForAcceptance('Acceptance | profile detail test', {
  beforeEach() {
    
    store = this.application.__container__.lookup('service:simpleStore');
    listData = PF.list();
    listXhr = xhr(API_LIST_URL_PAGE_ONE, 'GET', null, {}, 200, listData);
    detailData = PF.detail();
    detailXhr = xhr(API_DETAIL_URL, 'GET', null, {}, 200, detailData);
  },
  afterEach() {
    
  }
});

test('visit detail and update all fields', assert => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.descValue, PD.descOne);
    assert.equal(page.assigneeInput, PD.username);
  });
  // description
  page.descFill(PD.descTwo);
  andThen(() => {
    assert.equal(page.descValue, PD.descTwo);
  });
  // assignee
  let keyword = 'boy1';
  xhr(`${API_LIST_URL_PAGE_ONE_PERSON}person__icontains=${keyword}/`, 'GET', null, {}, 200, PersonF.search_power_select());
  selectSearch('.t-profile-assignee-select', keyword);
  selectChoose('.t-profile-assignee-select', keyword);
  andThen(() => {
    assert.equal(page.assigneeInput, keyword);
  });
  let payload = {
    id: PD.idOne,
    description: PD.descTwo,
    assignee: PD.assigneeSelectOne,
    filters: [{
      id: PFD.idOne,
      key: PFD.keyOne,
      context: PFD.contextOne,
      field: PFD.fieldOne,
      criteria: [TD.priorityOneId]
    }]
  };
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
});

// cancel modal tests

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
  clearxhr(listXhr);
  visit(DETAIL_URL);
  page.descFill(PD.descTwo);
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
      assert.equal(page.descValue, PD.descTwo);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  visit(DETAIL_URL);
  page.descFill(PD.descTwo);
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
      var profile = store.find('profile', PD.idOne);
      assert.equal(profile.get('description'), PD.descOne);
    });
  });
});

test('clicking cancel button with no edits will take from detail view to list view', (assert) => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
});

// delete modal tests

test('when click delete, modal displays and when click ok, profile is deleted and removed from store', assert => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'profile'}));
      assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
    });
  });
  xhr(`${API_LIST_URL}${PD.idOne}/`, 'DELETE', null, {}, 204, {});
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LIST_URL);
      assert.equal(store.find('profile', PD.idOne).get('length'), undefined);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when click delete, and click no modal disappears', assert => {
  clearxhr(listXhr);
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'profile'}));
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

// modal tests: end

test('deep linking with an xhr with a 404 status code will show up in the error component (person)', (assert) => {
  clearxhr(detailXhr);
  clearxhr(listXhr);
  const exception = `This record does not exist.`;
  xhr(`${API_LIST_URL}${PD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-error-message').text(), 'WAT');
  });
});
