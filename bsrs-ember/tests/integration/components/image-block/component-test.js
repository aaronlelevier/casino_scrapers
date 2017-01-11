import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('image-block', 'Integration | Component | image block', {
  integration: true
});

test('it renders with size class name', function(assert) {
  this.render(hbs`{{image-block size="medium"}}`);
  assert.equal(this.$('.medium').length, 1);
});
