import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import sinon from 'sinon';

moduleForComponent('django-login', 'Integration | Component | django login', {
  integration: true
});

let usernameField = 'login-form input[type="text"]';
let passwordField = 'login-form input[type="password"]';

test('uses django html form and sends credentials for login', function(assert) {
  const done = assert.async();
  this.set('loginHtml', mockHTML());
  let action = sinon.spy(function(credentials) { return Ember.RSVP.Promise.resolve(null); });
  this.on('postLogin', action);

  this.render(hbs`
    {{django-login
      rawHtml=loginHtml
      doLogin=(action 'postLogin')
    }}
  `);

  assert.equal(this.$(usernameField).length, 1, 'username input renders');
  assert.equal(this.$(passwordField).length, 1, 'password input renders');

  Ember.run(() => {
    this.$(usernameField).val('abcd');
    this.$(passwordField).val('1111');
    this.$('login-form button[type="submit"]').trigger('click');
  });

  Ember.run(() => {
    assert.ok(action.calledOnce, 'action called on click');
    let args = action.firstCall.args[0];
    assert.equal(args.username, 'abcd', 'username sent to action');
    assert.equal(args.password, '1111', 'password sent to action');
    assert.equal(args.csrfmiddlewaretoken, 'flux-capacitor', 'password sent to action');
    done();
  });
});

test('uses django html form error within HTML response', function(assert) {
  const done = assert.async();
  this.set('loginHtml', mockHTML());
  let action = function() {
    return Ember.RSVP.Promise.reject(mockErrorHTML());
  };
  this.on('postLogin', action);

  this.render(hbs`
    {{django-login
      rawHtml=loginHtml
      doLogin=(action 'postLogin')
    }}
  `);

  Ember.run(() => {
    this.$(usernameField).val('abcd');
    this.$(passwordField).val('1111');
    this.$('login-form button[type="submit"]').trigger('click');
  });

  Ember.run(() => {
    let msg = this.$('.errorlist').text().trim();
    assert.ok(msg, 'error message displayed');
    assert.equal(msg, 'Oops, there was an error.', 'message extracted from HTML');
    done();
  });
});

function mockErrorHTML() {
  return `<form>
    <div class="text-error">
      <p>Oops, there was an error.</p>
    </div>
</form>`;
}

function mockHTML() {
  return `<DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Login</title>
        <link rel="shortcut icon" type="image/png" href="/static/images/favicon.ico"/>
        <link rel="stylesheet" type="text/css" href="/static/css/basscss.min.css"/>
        <link rel="stylesheet" type="text/css" href="/static/css/fonts.css"/>
        <link rel="stylesheet" type="text/css" href="/static/css/form.css"/>
    </head>
    <body id="login">
        <main class="flex items-center justify-center login">
            <div class="login__panel rounded bg-white">
                <header class="login__header flex rounded-top bg-offWhite">
                    <div class="login__logo flex_auto">
                        <img src="/static/images/logo.png" class="login__logo__img">
                    </div>
                    <h1 class="login__title">Login</h1>
                </header>
                <form role="form" action="" method="post" class="login__form flex flex-column items-center p2">
                    <input type='hidden' name='csrfmiddlewaretoken' value='flux-capacitor' />
                    <div class="login__form-fields">
                            <label for="id_username">Username:</label>
                            <input class="input" id="id_username" name="username" type="text" autofocus required/>
                            <label for="id_password">Password:</label>
                            <input class="input" id="id_password" name="password" type="password" autofocus required/>
                    </div>
                    <button type="submit" class="login__btn btn mt0 mb1 open-sans-regular bg-lightGreen white rounded" tabindex="1">
                        Login
                    </button>
                    <input type="hidden" name="next" value="/login" />
                </form>
            </div>
        </main>
    </body>
</html>`;
}
