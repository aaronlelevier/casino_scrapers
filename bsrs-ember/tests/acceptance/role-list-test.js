//import Ember from 'ember';
//import { test } from 'qunit';
//import module from "bsrs-ember/tests/helpers/module";
//import startApp from 'bsrs-ember/tests/helpers/start-app';
//import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
//import roles from 'bsrs-ember/tests/helpers/roles';
//import authorization from 'bsrs-ember/tests/helpers/authorization';
//import config from 'bsrs-ember/config/environment'; 
//
//const USERNAME = "akrier";
//const PASSWORD = "tango";
//const ROLE_URL = "/admin/roles";
//const USERNAME_INPUT = "input.username";
//const PASSWORD_INPUT = "input.password";
//const SUBMIT_BTN = ".submit_btn";
//const API_PREFIX = "/" + config.APP.NAMESPACE;
//
//var application;
//
//var request = {"password":PASSWORD,"username":USERNAME};
//var response = {"token":"ey.ey.ab","session":{"username":"tkrier","status":"valid","first_name":"Tom","last_name":"Krier","id":4}};
//
//module('xx Acceptance | role-list', {
//  beforeEach() {
//    application = startApp();
//    var endpoint = API_PREFIX + ROLE_URL + "/";
//    xhr( endpoint ,"GET",null,authorization,200,roles );
//    xhr( API_PREFIX + "/api-token-auth/","POST",request,{},200,response );
//  },
//  afterEach() {
//    Ember.run(application, 'destroy');
//  }
//});
//
//test('visiting /roles', function(assert) {
//  visit(ROLE_URL);
//
//  fillIn(USERNAME_INPUT, USERNAME);
//  fillIn(PASSWORD_INPUT, PASSWORD);
//  click(SUBMIT_BTN);
//
//  andThen(() => {
//    assert.equal(currentURL(), '/admin/roles');
//    assert.equal(find('h1.roles').text(), 'Roles');
//  });
//});
//
//
