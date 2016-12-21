import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import {xhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import BASEURLS from 'bsrs-ember/utilities/urls';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import generalPage from 'bsrs-ember/tests/pages/general';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
// import PERSON_CURRENT from 'bsrs-ember/vendor/defaults/person-current';

const PD = PERSON_DEFAULTS.defaults();
// const PC = PERSON_CURRENT.defaults();

const PREFIX = config.APP.NAMESPACE;
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;

moduleForAcceptance('Acceptance | general application layout test', {
  beforeEach(assert) {
    xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TD.dashboard_text}});
  },
});

test('navigating to unkown route will redirect to dashboard', (assert) => {
  visit('/wat');
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL);
  });
});

test('if permissions cant view admin, then doesnt show icon', function(assert) {
  run(() => {
    this.store.push('person-current', {id: PD.idOne, permissions: ['view_ticket']});
  });
  generalPage.visitDashboard();
  andThen(() => {
    assert.equal(find('.t-nav-admin').length, 0);
  });
});
