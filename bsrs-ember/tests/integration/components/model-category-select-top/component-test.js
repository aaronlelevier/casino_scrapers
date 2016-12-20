import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('model-category-select-top', 'Integration | Component | model category select top', {
  integration: true
});

test('defaults to not use readonly as a classname', function(assert) {
  this.set('model', Ember.Object.create({
    sorted_categories: [], categories: [], isReadOnly: false
  }));
  this.render(hbs`{{model-category-select-top model=model readonly=model.isReadOnly}}`);
  let el = this.$('.readonly').first();
  assert.equal(el.length, 0, 'readonly class is not used');
});

test('uses readonly as a classname', function(assert) {
  this.set('model', Ember.Object.create({
    sorted_categories: [], categories: [], isReadOnly: true
  }));
  this.render(hbs`{{model-category-select-top model=model readonly=model.isReadOnly}}`);

  let el = this.$('.readonly').first();
  assert.equal(el.length, 1, 'readonly class is used');
});
