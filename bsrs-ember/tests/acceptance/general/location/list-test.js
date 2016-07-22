import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LOCATION_FIXTURES from 'bsrs-ember/vendor/location_fixtures';
import page from 'bsrs-ember/tests/pages/location';
import BASEURLS, { LOCATIONS_URL } from 'bsrs-ember/utilities/urls';

const LOCATION_URL = BASEURLS.base_locations_url + '/index';

moduleForAcceptance('Acceptance | location-list', {
  beforeEach() {
    xhr(LOCATIONS_URL + '?page=1','GET', null, {}, 200, LOCATION_FIXTURES.list() );
  },
});

test('visiting /locations', (assert) => {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), LOCATION_URL);
    assert.equal(find('.t-sort-name').text(), t('admin.location.label.name'));
    assert.equal(find('.t-sort-number').text(), t('admin.location.label.number'));
    assert.equal(find('.t-sort-location-level-name').text(), t('admin.location.label.location_level'));
    assert.equal(find('.t-sort-status-translated-name').text(), t('admin.location.label.status-name'));
  });
});
