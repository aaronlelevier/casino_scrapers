import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import <%= FirstCharacterModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= FirstCharacterModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import BASEURLS, { <%= CapitalizeModule %>_URL, <%= CapitalizeModule %>_LIST_URL  } from 'bsrs-ember/utilities/urls';
import generalPage from 'bsrs-ember/tests/pages/general';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_<%= CapitalizeModule %>_URL;
const DETAIL_URL = `${BASE_URL}/${<%= FirstCharacterModuleName %>D.idOne}`;
const API_DETAIL_URL = `${<%= CapitalizeModule %>_URL}${<%= FirstCharacterModuleName %>D.idOne}/`;

let store;

moduleForAcceptance('Acceptance | <%= dasherizedModuleName %> list test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = <%= FirstCharacterModuleName %>F.list();
    xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, listData);
  },
});

test('can click <%= dasherizedModuleName %>s from the Dashboard to grid  and then to detail', assert => {
  visit(BASEURLS.base_admin_url);
  andThen(() => {
    assert.equal(currentURL(), BASEURLS.base_admin_url);
  });
  generalPage.click<%= CapFirstLetterModuleName %>s();
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
  });
  xhr(API_DETAIL_URL, 'GET', null, {}, 200, <%= FirstCharacterModuleName %>F.detail());
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});
