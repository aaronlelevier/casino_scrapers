import Ember from 'ember';
import JqueryAjaxInitializer from 'bsrs-ember/initializers/jquery-ajax';
import { module, test } from 'qunit';
import sinon from 'sinon';

let application;

module('Unit | Initializer | jquery ajax', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
    this.sandbox = sinon.sandbox.create();
    this.server = this.sandbox.useFakeServer();
    this.server.autoRespond = true;
    this.mockResponse = [
      200, { "Content-Type": "application/json" }, '{"data":"Yo"}'
    ];
  },
  afterEach() {
    delete this.mockResponse;
    delete this.server;
    this.sandbox.restore();
    delete this.sandbox;
  }
});

test('uses ajaxPrefilter to setup XHR options', function(assert) {
  this.sandbox.spy(Ember.$, 'ajaxPrefilter');
  this.server.respondWith('GET', '/wasup', this.mockResponse);
  JqueryAjaxInitializer.initialize(application);
  Ember.$.get('/wasup');
  assert.ok(Ember.$.ajaxPrefilter.calledOnce, 'ajax preFilter used');
});

test('uses beforeSend to add X-CSRFToken header', function(assert) {
  let done = assert.async();
  this.server.respondWith('GET', '/wasup', this.mockResponse);
  JqueryAjaxInitializer.initialize(application);

  Ember.$.get('/wasup').done(function(data, status, xhr) {
    let headers = this.server.requests[0].requestHeaders;
    assert.ok(headers.hasOwnProperty('X-CSRFToken'), 'CSRF request header added');
    done();
  }.bind(this));
});

test('when request url begins with HTTP no X-CSRFToken header is added', function(assert) {
  let done = assert.async();
  this.server.respondWith('GET', 'http://wasup.com', this.mockResponse);
  JqueryAjaxInitializer.initialize(application);

  Ember.$.get('http://wasup.com').done(function(data, status, xhr) {
    let headers = this.server.requests[0].requestHeaders;
    assert.equal(headers.hasOwnProperty('X-CSRFToken'), false, 'CSRF request header NOT added');
    done();
  }.bind(this));
});

test('when request url begins with HTTPS no X-CSRFToken header is added', function(assert) {
  let done = assert.async();
  this.server.respondWith('GET', 'https://wasup.com', this.mockResponse);
  JqueryAjaxInitializer.initialize(application);

  Ember.$.get('https://wasup.com').done(function(data, status, xhr) {
    let headers = this.server.requests[0].requestHeaders;
    assert.equal(headers.hasOwnProperty('X-CSRFToken'), false, 'CSRF request header NOT added');
    done();
  }.bind(this));
});
