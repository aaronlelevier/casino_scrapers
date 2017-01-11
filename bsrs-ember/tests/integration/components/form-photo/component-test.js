import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('form-photo', 'Integration | Component | form photo', {
  integration: true
});

test('it renders with icon', function(assert) {
  this.render(hbs`{{form-photo icon="wrench"}}`);
  assert.equal(this.$('.wrench').length, 1);
});
