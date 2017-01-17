import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('card-sub-title', 'Integration | Component | card sub title', {
  integration: true
});

test('it renders as an h3 tag', function(assert) {
  this.render(hbs`{{#card-sub-title}} {{/card-sub-title}}`);
  assert.equal(this.$('h3').length, 1);
});

test('if pass title, then shows header tag', function(assert) {
  this.render(hbs`{{card-sub-title title="Giant Beanstalk"}}`);
  assert.equal(this.$().text().trim(), 'Giant Beanstalk');
});

test('if pass icon, display an icon', function(assert) {
  this.render(hbs`{{card-sub-title title="Sally Ride" icon="grav"}}`);
  assert.equal(this.$('[data-test-id="card-sub-title-icon"]').length, 1);
});
