import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import DT from 'bsrs-ember/vendor/defaults/dtd';
import TICKET from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import LF from 'bsrs-ember/vendor/location_fixtures';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/dtd';
import dtPage from 'bsrs-ember/tests/pages/dt';
import generalPage from 'bsrs-ember/tests/pages/general';
import ticketPage from 'bsrs-ember/tests/pages/tickets';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';

const DASHBOARD_URL = BASEURLS.dashboard_url;
const DT_URL = BASEURLS.base_dt_url;
const DT_NEW_URL = `${DT_URL}/new`;

const SEARCH = '.ember-power-select-search input';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_dt_url;//Routing
const DTD_URL = BASEURLS.base_dtd_url;//Request
const TICKET_URL = BASEURLS.base_tickets_url;//Ticket
const DETAIL_URL = `${BASE_URL}/${DT.idOne}`;
const DEST_URL = `${BASE_URL}/${DT.idTwo}`;
const TICKET_POST_URL = `${PREFIX}${TICKET_URL}/${DT.idTwo}/dt/`;
const TICKET_PATCH_URL = `${PREFIX}${TICKET_URL}/${DT.idTwo}/dt/`;

let application, store, endpoint, original_uuid;

module('Acceptance | dt detail', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('store:main');
    endpoint = `${PREFIX}${DTD_URL}/`;
    original_uuid = random.uuid;
    random.uuid = function() { return UUID.value; };
  },
  afterEach() {
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

test('go to /dashboard, click button to get to /dt/new', assert => {
  visit(DASHBOARD_URL);
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL);
  });
  generalPage.clickLaunchDTTicket();
  andThen(() => {
    assert.equal(currentURL(), DT_NEW_URL);
  });
});

// NOTE: not passing, need to first bootstrap Locations on logged in User
test('/dts/new - render form with requester and location selector', assert => {
  visit(DT_NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), DT_NEW_URL);
  });
  // requester
  andThen(() => {
    assert.equal(dtPage.requester, '');
  });
  dtPage.requesterFillin(TICKET.requesterOne);
  andThen(() => {
    assert.equal(dtPage.requester, TICKET.requesterOne);
  });
  // location select
  xhr(`${PREFIX}/admin/locations/?page=1&name__icontains=a`, 'GET', null, {}, 200, LF.search());
  dtPage.locationsClickDropdown();
  fillIn(`${SEARCH}`, 'a');
  andThen(() => {
    assert.equal(currentURL(), DT_NEW_URL);
    assert.equal(ticketPage.locationOptionLength, 2);
  });
  dtPage.locationsOptionOneClick();
  andThen(() => {
    let ticket = store.findOne('ticket');
    assert.equal(ticket.get('location.id'), LD.idFour);
  });
});
