import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import assignmentD from 'bsrs-ember/vendor/defaults/assignment';
import assignmentF from 'bsrs-ember/vendor/assignment_fixtures';
import PersonF from 'bsrs-ember/vendor/people_fixtures';
import page from 'bsrs-ember/tests/pages/assignment';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { ASSIGNMENT_URL, ASSIGNMENT_LIST_URL, PEOPLE_URL } from 'bsrs-ember/utilities/urls';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_ASSIGNMENT_URL;
const DETAIL_URL = `${BASE_URL}/${assignmentD.idOne}`;
const API_DETAIL_URL = `${ASSIGNMENT_URL}${assignmentD.idOne}/`;

var store, detailXhr, listXhr;

moduleForAcceptance('Acceptance | assignment detail test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = assignmentF.list();
    listXhr = xhr(`${ASSIGNMENT_URL}?page=1`, 'GET', null, {}, 200, listData);
    const detailData = assignmentF.detail();
    detailXhr = xhr(API_DETAIL_URL, 'GET', null, {}, 200, detailData);
  },
});

test('by clicking record in list view, User is sent to detail view', assert => {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
  });
  generalPage.gridItemOneClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('visit detail and update all fields', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.descriptionValue, assignmentD.descriptionOne);
    assert.equal(page.assigneeInput, assignmentD.username);
  });
  // description
  page.descriptionFill(assignmentD.descriptionTwo);
  andThen(() => {
    assert.equal(page.descriptionValue, assignmentD.descriptionTwo);
    const assignment = store.find('assignment', assignmentD.idOne);
    assert.equal(assignment.get('description'), assignmentD.descriptionTwo);
  });
  // assignee
  let keyword = 'boy1';
  xhr(`${PEOPLE_URL}person__icontains=${keyword}/`, 'GET', null, {}, 200, PersonF.search_power_select());
  selectSearch('.t-assignment-assignee-select', keyword);
  selectChoose('.t-assignment-assignee-select', keyword);
  andThen(() => {
    assert.equal(page.assigneeInput, keyword);
  });
  xhr(API_DETAIL_URL, 'PUT', assignmentF.put({description: assignmentD.descriptionTwo, assignee: assignmentD.assigneeSelectOne}), {}, 200, assignmentF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
  });
});

// cancel modal tests

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
  clearxhr(listXhr);
  page.visitDetail();
  page.descriptionFill(assignmentD.descriptionTwo);
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
      assert.equal(page.descriptionValue, assignmentD.descriptionTwo);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  page.visitDetail();
  page.descriptionFill(assignmentD.descriptionTwo);
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
      assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
      var assignment = store.find('assignment', assignmentD.idOne);
      assert.equal(assignment.get('description'), assignmentD.descriptionOne);
    });
  });
});

test('clicking cancel button with no edits will take from detail view to list view', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
  });
});

// delete modal tests

test('when click delete, modal displays and when click ok, assignment is deleted and removed from store', assert => {
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
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'assignment'}));
      assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
    });
  });
  xhr(`${ASSIGNMENT_URL}${assignmentD.idOne}/`, 'DELETE', null, {}, 204, {});
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
      assert.equal(store.find('assignment', assignmentD.idOne).get('length'), undefined);
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
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'assignment'}));
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
  xhr(`${ASSIGNMENT_URL}${assignmentD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-error-message').text(), 'WAT');
  });
});
