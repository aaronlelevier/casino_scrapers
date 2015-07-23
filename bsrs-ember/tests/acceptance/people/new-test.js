import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import config from 'bsrs-ember/config/environment';

const PREFIX = config.APP.NAMESPACE;
const PEOPLE_URL = "/admin/people";
const PEOPLE_NEW_URL = PEOPLE_URL + '/new';
const SAVE_BTN = '.t-save-btn';

var application, store;

module('sco Acceptance | people-new', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        var endpoint = PREFIX + PEOPLE_URL + "/";
        xhr( endpoint ,"GET",null,{},200,PEOPLE_FIXTURES.empty() );
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('visiting /people/new', (assert) => {
    visit(PEOPLE_URL);
    click('.t-person-new');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_NEW_URL); 
        assert.equal(store.find('person').length, 0);
    });
    fillIn('.t-person-username', 'mgibson');
    fillIn('.t-person-password', '123');
    var payload = {username: 'mgibson', password: '123'};
    var response = {id: 1, username: 'mgibson', password: '123'};
    var url = PREFIX + PEOPLE_NEW_URL + '/';
    xhr( url,'POST',payload,{},201,response );
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL); 
        assert.equal(store.find('person').length, 1);
        assert.equal(store.findOne('person').get('id'), 1);
    });
});
