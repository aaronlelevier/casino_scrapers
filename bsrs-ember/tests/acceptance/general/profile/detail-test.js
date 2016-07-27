import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import config from 'bsrs-ember/config/environment';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS from 'bsrs-ember/utilities/urls';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PF from 'bsrs-ember/vendor/profile_fixtures';
import PersonF from 'bsrs-ember/vendor/people_fixtures';
import page from 'bsrs-ember/tests/pages/profile';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import random from 'bsrs-ember/models/random';
import { PROFILE_URL, PROFILE_LIST_URL, PEOPLE_URL } from 'bsrs-ember/utilities/urls';

const BASE_URL = BASEURLS.base_profile_url;
const DETAIL_URL = `${BASE_URL}/${PD.idOne}`;
const API_DETAIL_URL = `${PROFILE_URL}${PD.idOne}/`;

const SEARCH = '.ember-power-select-search input';

var application, store, detailXhr, listXhr;

moduleForAcceptance('Acceptance | profile detail test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    listXhr = xhr(`${PROFILE_URL}?page=1`, 'GET', null, {}, 200, PF.list());
    detailXhr = xhr(API_DETAIL_URL, 'GET', null, {}, 200, PF.detail());
  }
});

test('visit detail and update description and assignee', assert => {
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
  xhr(`${PEOPLE_URL}person__icontains=${keyword}/`, 'GET', null, {}, 200, PersonF.search_power_select());
  selectSearch('.t-profile-assignee-select', keyword);
  selectChoose('.t-profile-assignee-select', keyword);
  andThen(() => {
    assert.equal(page.assigneeInput, keyword);
  });
  xhr(API_DETAIL_URL, 'PUT', PF.put({description: PD.descTwo, assignee: PD.assigneeSelectOne}), {}, 200, PF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), PROFILE_LIST_URL);
  });
});

test('visit detail and add a pfilter', assert => {
  random.uuid = function() { return UUID.value; };
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-filter-selector').length, 1);
    assert.equal(find('.t-filter-selector').text().trim(), t(PFD.keyOne));
  });
  page.removeFilterBtnClick();
  andThen(() => {
    assert.equal(find('.t-filter-selector').length, 0);
  });
  page.addFilterBtnClick();
  andThen(() => {
    assert.equal(find('.t-filter-selector').length, 1);
    assert.equal(find('.t-filter-selector').text().trim(),t(PFD.keyOne));
  });
  page.filterClickDropdown();
  selectChoose('.t-filter-selector', PFD.keyTwo);
  andThen(() => {
    assert.equal(find('.t-filter-selector').text().trim(), t(PFD.keyTwo));
  });
  const filters = [{
    id: UUID.value,
    key: PFD.keyTwo,
    context: PFD.contextOne,
    field: PFD.fieldTwo,
    criteria: []
  }];
  xhr(API_DETAIL_URL, 'PUT', PF.put({filters: filters}), {}, 200, PF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), PROFILE_LIST_URL);
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
      assert.equal(currentURL(), PROFILE_LIST_URL);
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
    assert.equal(currentURL(), PROFILE_LIST_URL);
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
  xhr(`${PROFILE_URL}${PD.idOne}/`, 'DELETE', null, {}, 204, {});
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), PROFILE_LIST_URL);
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
  xhr(`${PROFILE_URL}${PD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-error-message').text(), 'WAT');
  });
});
