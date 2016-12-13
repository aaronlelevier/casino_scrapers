import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import LD from 'bsrs-ember/vendor/defaults/location';
import BASEURLS from 'bsrs-ember/utilities/urls';

const LOC_URL = BASEURLS.base_locations_url;
const LOCATION_URL = `${LOC_URL}/index`;
const DETAIL_URL = `${LOC_URL}/${LD.idOne}`;

let originalLoggerError, originalTestAdapterException;

moduleForAcceptance('Acceptance | general application error test', {
  error: 500,
  beforeEach() {
    errorSetup();
  },
  afterEach() {
    errorTearDown();
  }
});

test('xhr with a 500 on locale fetch', (assert) => {
  visit(LOCATION_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    assert.equal(find('[data-test-id=error-500]').length, 1);
  });
});
