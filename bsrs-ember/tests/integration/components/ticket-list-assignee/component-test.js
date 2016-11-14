import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ticket-list-assignee', 'Integration | Component | ticket list assignee', {
  integration: true
});

test('it renders with photo component', function(assert) {
  this.item = { assignee: { id: '1', fullname: 'scooter', image_thumbnail: 'wat.jpg'} };
  this.render(hbs`{{ticket-list-assignee item=item}}`);
  assert.equal(this.$('[data-test-id="user-fullname"]').text(), 'scooter');
  assert.equal(this.$('[data-test-id="user-avatar"]').css('background-image').indexOf('wat.jpg'), -1);
  assert.ok(this.$('[data-test-id="user-avatar"]').hasClass('empty'));
});
