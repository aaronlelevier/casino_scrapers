import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('work-orders/new/buttons', 'Integration | Component | work orders/new/buttons', {
  integration: true,
  beforeEach() {
    this.steps = ['work-orders/new/step-1', 'work-orders/new/step-2'];
    this.componentRendered = this.steps[0];
    // comes from state machine
    this.currentStateRendered = { hasBackBtn: true, hasNextBtn: true };
  }
});

test('it renders with next action', function(assert) {
  assert.expect(1);
  this.next = function() {
    assert.ok(true);
  };
  this.render(hbs`{{work-orders/new/buttons 
    next=next
    steps=steps
    componentRendered=componentRendered
    currentStateRendered=currentStateRendered
  }}`);
  this.$('[data-test-id="next"]').click();
});

test('it renders with back action', function(assert) {
  assert.expect(2);
  this.back = function() {
    assert.ok(true);
  };
  this.render(hbs`{{work-orders/new/buttons 
    back=back
    steps=steps
    componentRendered="work-orders/new/step-2"
    currentStateRendered=currentStateRendered
  }}`);
  assert.equal(this.$('[data-test-id="back"]').length, 1);
  this.$('[data-test-id="back"]').click();
});

test('it doesnt render with back action if on step1', function(assert) {
  assert.expect(1);
  this.back = function() {
    assert.ok(true);
  };
  this.render(hbs`{{work-orders/new/buttons 
    back=back 
    steps=steps
    componentRendered="work-orders/new/step-1"
  }}`);
  assert.equal(this.$('[data-test-id="back"]').length, 0);
});

test('it renders with labels', function(assert) {
  assert.expect(1);
  this.render(hbs`{{work-orders/new/buttons
    componentRendered=componentRendered
    currentStateRendered=currentStateRendered
  }}`);
  assert.equal(this.$('[data-test-id="next"]').text().trim(), 'work_order.create.next');
});

test('if saveWorkOrderTask isRunning, btn is disabled', function(assert) {
  this.saveWorkOrderTask = { isRunning: 'disabled' };
  this.currentStateRendered = { hasWorkOrderDispatchBtn: true };
  assert.expect(1);
  this.render(hbs`{{work-orders/new/buttons
    componentRendered=componentRendered
    currentStateRendered=currentStateRendered
    saveWorkOrderTask=saveWorkOrderTask
  }}`);
  assert.equal(this.$('[data-test-id="wo-send-post"]').attr('disabled'), 'disabled', 'Button is disabled if xhr save is outstanding');
});
