import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('card-title', 'Integration | Component | card title', {
  integration: true
});

test('it renders as a section tag', function(assert) {
  this.render(hbs`{{#card-title}} {{/card-title}}`);
  assert.equal(this.$('section').length, 1);
});

test('if pass title, then shows header tag', function(assert) {
  this.render(hbs`{{card-title title="wat"}}`);
  assert.equal(this.$('[data-test-id="h2"]').text().trim(), 'wat');
});

test('if dont pass title, acts as block component', function(assert) {
  this.render(hbs`{{#card-title}}foobar{{/card-title}}`);
  assert.equal(this.$().text().trim(), 'foobar');
});
