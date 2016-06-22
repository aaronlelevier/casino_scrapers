import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('mobile-save-filter', 'Integration | Component | mobile save filter', {
  integration: true
});

test('it renders with a span and input', function(assert) {
  this.render(hbs`{{mobile-save-filter}}`);
  assert.ok(this.$('input').hasClass('mobile-save-filterset__input'));
  assert.ok(this.$('span > i').hasClass('fa-close'));
});
