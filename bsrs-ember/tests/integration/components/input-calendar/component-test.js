import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('input-calendar', 'Integration | Component | input calendar', {
  integration: true
});

test('input-calendar renders correctly with correct elemets', function(assert) {
  this.render(hbs`{{input-calendar dataTestId="scheduled-date"}}`);
  assert.ok(this.$('[data-test-id="scheduled-date"]').hasClass('input-group'));
  assert.ok(this.$('[data-test-id="scheduled-date"] input').hasClass('form-control'));
  assert.ok(this.$('[data-test-id="scheduled-date"] span').hasClass('input-group-addon'));
  assert.ok(this.$('[data-test-id="scheduled-date"] span i').hasClass('fa fa-calendar'));
});
