import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('grid/helpers/saving-filter', 'Integration | Component | grid saving filter', {
  integration: true
});

test('it renders with labelledby and described by for filterset modal', function(assert) {
  this.savingFilter = true;
  this.render(hbs`{{grid/helpers/saving-filter savingFilter=savingFilter}}`);
  assert.equal(Ember.$('[role="filterset"]').attr('aria-labelledby'), 'filtersetTitle');
  assert.equal(Ember.$('[role="filterset"]').attr('aria-describedby'), 'filtersetBody');
});

test('it renders with labelledby and described by for columnFilter modal', function(assert) {
  this.toggleFilter = true;
  this.render(hbs`{{grid/helpers/saving-filter toggleFilter=toggleFilter}}`);
  assert.equal(Ember.$('[role="columnFilter"]').attr('aria-labelledby'), 'columnFilterTitle');
  assert.equal(Ember.$('[role="columnFilter"]').attr('aria-describedby'), 'columnFilterBody');
});
