import { moduleFor, test } from 'ember-qunit';
import sinon from 'sinon';
import windowProxy from 'bsrs-ember/utilities/window-proxy';
import Ember from 'ember';

moduleFor('service:django-login', 'Unit | Service | django login', {
  beforeEach() {
    this.sandbox = sinon.sandbox.create();
    this.server = this.sandbox.useFakeServer();
    this.server.autoRespond = true;
  },
  afterEach() {
    delete this.server;
    this.sandbox.restore();
    delete this.sandbox;
  }
});

test('#loadForm success returns html string via promise resolution', function(assert) {
  const done = assert.async();
  let service = this.subject();
  this.server.respondWith('GET', '/api-auth/logout/', [
    200, { "Content-Type": "text/html" }, mockHTML()
  ]);
  this.server.respondWith('GET', '/login/', [
    200, { "Content-Type": "text/html" }, mockHTML()
  ]);
  let promise = service.loadForm();
  assert.ok(typeof promise.then === 'function', 'returns a thenable, promise');
  promise.then((resp) => {
    assert.ok(typeof resp === 'string', 'response is a string');
    done();
  });
});

test('#loadForm failure redirects to /login via promise rejection', function(assert) {
  const done = assert.async();
  let service = this.subject();
  this.server.respondWith('GET', '/api-auth/logout/', [
    200, { "Content-Type": "text/html" }, mockHTML()
  ]);
  this.server.respondWith('GET', '/login/', [
    500, { 'Content-Type': 'text/html' }, 'server error'
  ]);
  this.sandbox.stub(windowProxy, 'changeLocation');
  let promise = service.loadForm();
  promise.catch((resp) => {
    assert.ok(windowProxy.changeLocation.calledOnce, 'location changed on failure');
    done();
  });
});

test('#postLogin sents credentials to server, success prevents redirect', function(assert) {
  const done = assert.async();
  this.server.respondWith('/api-auth/login/', mockAppHtml());
  let service = this.subject();
  this.sandbox.stub(windowProxy, 'changeLocation', function(){});
  let promise = service.postLogin({
    username: 'abcd', password: '1111', csrfmiddlewaretoken: 'flux-capacitor'
  });
  promise.then((resp) => {
    assert.equal(windowProxy.changeLocation.calledOnce, false, 'no redirect to /login');
    assert.equal(resp, null, 'promise resolves with null response');
    done();
  });
});

test('#postLogin with bad credentails (403) does not redirect, user can try again', function(assert) {
  let adapterException = Ember.Test.adapter.exception;
  Ember.Test.adapter.exception = () => { return null; };

  const done = assert.async();
  this.server.respondWith('/api-auth/login/', [403, {}, '']);
  let service = this.subject();
  this.sandbox.stub(windowProxy, 'changeLocation', function(){});
  let promise = service.postLogin({
    username: 'abcd', password: '1111', csrfmiddlewaretoken: 'flux-capacitor'
  });
  promise.catch((resp) => {
    assert.equal(windowProxy.changeLocation.calledOnce, false, 'does not redirect to /login');

    Ember.Test.adapter.exception = adapterException;
    done();
  });
});

test('#postLogin failure redirects to /login/', function(assert) {
  let adapterException = Ember.Test.adapter.exception;
  Ember.Test.adapter.exception = () => { return null; };

  const done = assert.async();
  this.server.respondWith('/api-auth/login/', [500, {}, '']);
  let service = this.subject();
  this.sandbox.stub(windowProxy, 'changeLocation', function(){});
  let promise = service.postLogin({
    username: 'abcd', password: '1111', csrfmiddlewaretoken: 'flux-capacitor'
  });
  promise.catch((resp) => {
    assert.ok(windowProxy.changeLocation.calledOnce, 'redirects to /login');
    assert.equal(windowProxy.changeLocation.firstCall.args[0], '/login/', 'redirects to /login');

    Ember.Test.adapter.exception = adapterException;
    done();
  });
});

function mockHTML() {
  return `<DOCTYPE html>
<html>
  <body>
    <form></form>
  </body>
</html>`;
}

function mockAppHtml() {
  return `<DOCTYPE html>
<html>
  <head>
    <meta name="bsrs-ember/config/environment">
  </head>
  <body>
  </body>
</html>`;
}
