import { test } from 'qunit';
import {xhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import BASEURLS from 'bsrs-ember/utilities/urls';
import TD from 'bsrs-ember/vendor/defaults/tenant';

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
