import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location-level_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS, { LOCATION_LEVELS_URL } from 'bsrs-ember/utilities/urls';

const BASE_URL = BASEURLS.base_location_levels_url;
const LOCATION_LEVEL_URL = BASE_URL + '/index';

let application;

module('Acceptance | location-level-list', {
  beforeEach() {
    application = startApp();
    xhr(`${LOCATION_LEVELS_URL}?page=1` ,'GET',null,{}, 200, LOCATION_LEVEL_FIXTURES.list() );
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /location-levels', function(assert) {
  visit(LOCATION_LEVEL_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
    assert.equal(find('.t-sort-name').text(), t('admin.locationlevel.label.name'));
  });
});
