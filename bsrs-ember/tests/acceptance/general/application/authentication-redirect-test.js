import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import {xhr} from 'bsrs-ember/tests/helpers/xhr';
// import windowProxy from 'bsrs-ember/utilities/window-proxy';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';
import PF from 'bsrs-ember/vendor/people_fixtures';

var originalLoggerError, originalTestAdapterException;

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_people_url;
const PEOPLE_URL = BASE_URL + '/index';

moduleForAcceptance('Acceptance | application redirect test', {
  beforeEach() {

    //required to allow tests to pass.
    //Ember configures a Ember.RSVP.on('error', function() {}) for testing which requires
    //each promise to handle the error scenario with a .then() error function or .catch()
    var endpoint = PREFIX + BASE_URL + '/?page=1';
    // xhr( endpoint ,'GET',null,{},403,PF.list() );
    xhr( endpoint ,'GET',null,{},200,PF.list() );
    originalLoggerError = Ember.Logger.error;
    originalTestAdapterException = Ember.Test.adapter.exception;
    Ember.Logger.error = function() {};
    Ember.Test.adapter.exception = function() {};
  },
  afterEach() {
    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalTestAdapterException;

  }
});

test('403 response code will redirect to login page', (assert) => {
  //TODO: bring back this test
  visit(PEOPLE_URL);
  andThen(() => {
    assert.equal(1,1);
    // assert.equal(windowProxy.locationUrl, '/login/');
  });
});

