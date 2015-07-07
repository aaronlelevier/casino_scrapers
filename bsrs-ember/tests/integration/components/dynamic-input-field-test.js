import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('dynamic-input-field', 'integration: dynamic-input-field test', {
  integration: true
});

test('renders input with computed value property', function(assert) {
  var obj = Ember.Object.create({
    text: null
  });
  var prop = 'text';
  this.set('obj', obj);
  this.set('prop', prop);

  this.render(hbs`{{dynamic-input-field prop=prop obj=obj}}`);

  assert.equal(this.$('.t-new-entry').val(), '');

  this.$('.t-new-entry').val('andier');
  assert.equal(this.$('.t-new-entry').val(), 'andier');
});
