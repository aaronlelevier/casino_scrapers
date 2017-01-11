import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

let imageString = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

moduleForComponent('photo-display', 'Integration | Component | photo display', {
  integration: true
});

test('it renders the dropped image', function(assert) {
  this.set('image', imageString);
  this.render(hbs`{{photo-display image=image}}`);
  let style = this.$('div').css('background-image');
  let expectedStyle = `url(${imageString})`;
  assert.equal(style.replace(/"/g, ""), expectedStyle);
});
