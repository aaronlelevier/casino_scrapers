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
  this.render(hbs`{{card-title title="Giant Beanstalk"}}`);
  assert.equal(this.$('[data-test-id="h2"]').text().trim(), 'Giant Beanstalk');
});

test('if dont pass title, acts as block component', function(assert) {
  this.render(hbs`{{#card-title}}Wyatt Earp{{/card-title}}`);
  assert.equal(this.$().text().trim(), 'Wyatt Earp');
});
