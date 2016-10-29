import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('app-notice', 'Integration | Component | app notice', {
  integration: true
});

test('defaults to error level notice', function(assert) {
  this.render(hbs`{{app-notice}}`);
  assert.ok(this.$('app-notice').hasClass('app-notice--error'), 'error modifier class is set');
});

test('supports optional info level notice', function(assert) {
  this.render(hbs`{{app-notice noticeLevel='info'}}`);
  assert.ok(this.$('app-notice').hasClass('app-notice--info'), 'info modifier class is set');
});

test('displays message', function(assert) {
  let msg = 'Server Error';
  this.set('message', msg);
  this.render(hbs`{{app-notice message=message}}`);
  assert.ok(this.$('.app-notice__msg').text().match(new RegExp(msg)), 'Error text displayed');
});

test('click to dismiss message', function(assert) {
  let done = assert.async();
  this.set('message', 'Opps there was an error.');

  this.set('dismiss_errors', () => {
    this.set('message', '');
  });

  this.render(hbs`
    {{#if message}}
      {{app-notice
        message=message
        on-dismiss=(action dismiss_errors)
      }}
    {{/if}}
  `);

  assert.ok(this.$('app-notice').length === 1, 'Notice displayed.');

  this.$('app-notice').trigger('click');

  return wait().then( () => {
    assert.ok(this.get('message') === '', 'message cleared in context by action');
    assert.ok(this.$('app-notice').length === 0, 'Notice dismissed.');
    done();
  });
});
