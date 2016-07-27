import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import assignmentD from 'bsrs-ember/vendor/defaults/assignment';
import assignmentF from 'bsrs-ember/vendor/assignment_fixtures';
import BASEURLS, { ASSIGNMENT_URL, ASSIGNMENT_LIST_URL } from 'bsrs-ember/utilities/urls';
import generalPage from 'bsrs-ember/tests/pages/general';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_ASSIGNMENT_URL;
const DETAIL_URL = `${BASE_URL}/${assignmentD.idZero}`;
const API_DETAIL_URL = `${ASSIGNMENT_URL}${assignmentD.idZero}/`;

let store;

moduleForAcceptance('Acceptance | assignment list test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = assignmentF.list();
    xhr(`${ASSIGNMENT_URL}?page=1`, 'GET', null, {}, 200, listData);
  },
});

test('can click assignments from the Dashboard to grid  and then to detail', assert => {
  visit(BASEURLS.base_admin_url);
  andThen(() => {
    assert.equal(currentURL(), BASEURLS.base_admin_url);
  });
  generalPage.clickAssignments();
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
  });
  xhr(API_DETAIL_URL, 'GET', null, {}, 200, assignmentF.detail());
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});
