import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import windowProxy from 'bsrs-ember/utilities/window-proxy';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

var application, originalLoggerError, originalTestAdapterException;

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_people_url;
const PEOPLE_URL = BASE_URL + '/index';

module('Acceptance | application redirect test', {
    beforeEach() {
        application = startApp();
        //required to allow tests to pass.
        //Ember configures a Ember.RSVP.on('error', function() {}) for testing which requires
        //each promise to handle the error scenario with a .then() error function or .catch()
        var endpoint = PREFIX + BASE_URL + "/";
        xhr( endpoint ,'GET',null,{},403,[] );
        originalLoggerError = Ember.Logger.error;
        originalTestAdapterException = Ember.Test.adapter.exception;
        Ember.Logger.error = function() {};
        Ember.Test.adapter.exception = function() {};
    },
    afterEach() {
        Ember.Logger.error = originalLoggerError;
        Ember.Test.adapter.exception = originalTestAdapterException;
        Ember.run(application, 'destroy');
    }
});

test('403 response code will redirect to login page', (assert) => {
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(windowProxy.locationUrl, '/login');
    });
});
