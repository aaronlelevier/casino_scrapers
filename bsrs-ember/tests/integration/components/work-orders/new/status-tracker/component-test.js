import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('work-orders/new/status-tracker', 'Integration | Component | work orders/new/status tracker', {
  integration: true
});

test('it renders with step1 action', function(assert) {
  assert.expect(3);
  this.determineStep = function() {
    assert.ok(true);
  };
  this.render(hbs`{{work-orders/new/status-tracker determineStep=determineStep}}`);
  this.$('[data-test-id="step1"]').click();
  this.$('[data-test-id="step2"]').click();
  this.$('[data-test-id="step3"]').click();
});

test('it renders with labels', function(assert) {
  assert.expect(3);
  this.render(hbs`{{work-orders/new/status-tracker}}`);
  assert.equal(this.$('[data-test-id="step1"]').text().trim(), 'work_order.create.select_provider');
  assert.equal(this.$('[data-test-id="step2"]').text().trim(), 'work_order.create.cost_schedule');
  assert.equal(this.$('[data-test-id="step3"]').text().trim(), 'work_order.create.confirm_send');
});
