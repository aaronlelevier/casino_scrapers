import Ember from 'ember';
const { run } = Ember;
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/person-mobile';
import peoplePage from 'bsrs-ember/tests/pages/person';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import pageDrawer from 'bsrs-ember/tests/pages/nav-drawer';
import BASEURLS, { PEOPLE_URL } from 'bsrs-ember/utilities/urls';

var store;

const BASE_URL = BASEURLS.base_people_url;
const PEOPLE_INDEX_URL = `${BASE_URL}/index`;
const DETAIL_URL = `${BASE_URL}/${PD.idOne}`;
// const PEOPLE_PUT_URL = `${PREFIX}${BASE_URL}/${PD.idOne}/`;

moduleForAcceptance('Acceptance | mobile people detail test', {
  beforeEach() {
    setWidth('mobile');
    store = this.application.__container__.lookup('service:simpleStore');
    xhr(`${PEOPLE_URL}?page=1`, 'GET', null, {}, 200, PF.list());
    xhr(`${PEOPLE_URL}${PD.idOne}/`, 'GET', null, {}, 200, PF.detail(PD.idOne));
  },
});

/* jshint ignore:start */

test('can click from admin to people grid to detail', async assert => {
  await generalPage.visitAdmin();
  assert.equal(currentURL(), BASEURLS.base_admin_url);
  await pageDrawer.clickDrawer();
  await pageDrawer.clickAdmin();
  await generalPage.clickPeople();
  assert.equal(currentURL(), PEOPLE_INDEX_URL);
  await generalPage.gridItemZeroClick();
  assert.equal(currentURL(), DETAIL_URL);
});


/* jshint ignore:end */
