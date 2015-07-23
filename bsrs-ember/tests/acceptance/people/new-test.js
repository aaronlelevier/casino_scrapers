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

module('Acceptance | people-new', {
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
    fillIn('.t-person-email', 'abc@gmail.com');
    fillIn('.t-person-first_name', 'Mel');
    fillIn('.t-person-last_name', 'Gibson');
    fillIn('.t-person-role', 1);//TODO: make true select with multiple options
    var payload = {username: 'mgibson', password: '123', email: 'abc@gmail.com', role: 1, first_name:'Mel', last_name: 'Gibson', phone_numbers: [], addresses: [], location: '', status: 1 };
    var response = {id: 1, username: 'mgibson', password: '123', email: 'abc@gmail.com', role: 1, first_name:'Mel', last_name: 'Gibson', phone_numbers: [], addresses: [], location: '', status: 1 };
    var url = PREFIX + PEOPLE_URL + '/';
    xhr( url,'POST',payload,{},201,response );
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL); 
        assert.equal(store.find('person').length, 1);
        assert.equal(store.findOne('person').get('id'), 1);
        assert.equal(store.findOne('person').get('username'), 'mgibson');
        assert.equal(store.findOne('person').get('password'), '123');
        assert.equal(store.findOne('person').get('email'), 'abc@gmail.com');
        assert.equal(store.findOne('person').get('role'), 1);
        assert.equal(store.findOne('person').get('first_name'), 'Mel');
        assert.equal(store.findOne('person').get('last_name'), 'Gibson');
        assert.deepEqual(store.findOne('person').get('phone_numbers'), []);
        assert.deepEqual(store.findOne('person').get('addresses'), []);
        assert.equal(store.findOne('person').get('status'), 1);
        assert.equal(store.findOne('person').get('location'), '');
    });
});

