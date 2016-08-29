import Ember from 'ember';
const { run } = Ember;
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import RD from 'bsrs-ember/vendor/defaults/role';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/person-mobile';
import peoplePage from 'bsrs-ember/tests/pages/person';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import pageDrawer from 'bsrs-ember/tests/pages/nav-drawer';
import BASEURLS, { PEOPLE_URL, LOCATIONS_URL } from 'bsrs-ember/utilities/urls';

var store;

const BASE_URL = BASEURLS.base_people_url;
const PEOPLE_INDEX_URL = `${BASE_URL}/index`;
const DETAIL_URL = `${BASE_URL}/${PD.idOne}`;
const PEOPLE_PUT_URL = `${PEOPLE_URL}${PD.idOne}/`;
const LOCATION = '.t-person-locations-select';
const ROLE = '.t-person-role-select';

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

test('can click through component sections and save to redirect to index', async assert => {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  await generalMobilePage.footerItemTwoClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(1)').hasClass('active'));
  await generalMobilePage.footerItemThreeClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(2)').hasClass('active'));
  // await generalMobilePage.footerItemFourClick();
  // assert.ok(Ember.$('.t-mobile-footer-item:eq(3)').hasClass('active'));
  await generalMobilePage.footerItemOneClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(0)').hasClass('active'));
  let payload = PF.put({id: PD.idOne});
  xhr(PEOPLE_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  await generalPage.save();
  assert.equal(currentURL(), PEOPLE_INDEX_URL);
});

test('can update fields and save', async assert => {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  const person = store.find('person', PD.idOne);
  assert.equal(find('.t-detail-title').text(), person.get('fullname'));
  xhr(`${LOCATIONS_URL}location__icontains=ABC1234/?location_level=${LLD.idOne}`, 'GET', null, {}, 200, LF.list_power_select());
  await selectSearch(LOCATION, 'ABC1234');
  // role change will clear out locations
  await selectChoose(LOCATION, `${LD.baseStoreName}4`);
  await selectChoose(ROLE, RD.nameTwo);
  const payload = PF.put({id: PD.idOne, role: RD.idTwo, locations: []});
  xhr(PEOPLE_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  await generalPage.save()
  assert.equal(currentURL(), PEOPLE_INDEX_URL);
});


/* jshint ignore:end */
