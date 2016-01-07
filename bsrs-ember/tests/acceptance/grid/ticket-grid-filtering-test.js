import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import PD from 'bsrs-ember/vendor/defaults/person';
import PERSON_LD from 'bsrs-ember/vendor/defaults/person-location';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import {isNotFocused} from 'bsrs-ember/tests/helpers/focus';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';
import random from 'bsrs-ember/models/random';
import timemachine from 'vendor/timemachine';
import moment from 'moment';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = BASE_URL + '/index';
const NUMBER_ONE = {keyCode: 49};
const LETTER_R = {keyCode: 82};
const LETTER_O = {keyCode: 79};
const LETTER_X = {keyCode: 88};
const NUMBER_FOUR = {keyCode: 52};
const BACKSPACE = {keyCode: 8};
const SORT_PRIORITY_DIR = '.t-sort-priority-translated-name-dir';
const SORT_STATUS_DIR = '.t-sort-status-translated-name-dir';
const SORT_LOCATION_DIR = '.t-sort-location-name-dir';
const SORT_ASSIGNEE_DIR = '.t-sort-assignee-fullname-dir';
const FILTER_PRIORITY = '.t-filter-priority-translated-name';

var application, store, endpoint, list_xhr, original_uuid;


// TODO: Current-Person's Locations need to be known in order to filter the Tickets

/*
1) in the route inject the person_current service

app/tickets/index/route.js

2) OR instead inject that into the BASE GridViewRoute

app/mixins/route/components/grid

3) push that current_user to the findWithQuery in the model function (of app/mixins/route/components/grid)

4) update the base repository to “ask for” the function it should use to filter

https://github.com/bigskytech/bsrs/blob/master/bsrs-ember/app/mixins/components/grid/repository.js#L29

then use that function w/ apply (or call) to pass the current_person

*get the func, invoke it w/ current_person.get(‘person.locations’)
*/

// module('Acceptance | ticket grid test', {
//     beforeEach() {
//         timemachine.config({
//             dateString: 'December 25, 2014 13:12:59'
//         });
//         application = startApp();
//         store = application.__container__.lookup('store:main');
//         endpoint = PREFIX + BASE_URL + '/?page=1';
//         list_xhr = xhr(endpoint, 'GET', null, {}, 200, TF.list_three_diff_locations());
//         original_uuid = random.uuid;
//     },
//     afterEach() {
//         random.uuid = original_uuid;
//         Ember.run(application, 'destroy');
//         timemachine.reset();
//     }
// });

// test('aaron filter Tickets by ticket.location that is in the logged in Persons Locations', function(assert) {
//     visit(TICKET_URL);
//     return pauseTest();
// });

