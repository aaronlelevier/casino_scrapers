import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';


moduleForComponent('mobile/full-screen', 'amk Integration | Component | full-screen-footer', {
  integration: true
});

test('full screen footer renders with multiple footer items', function(assert) {
  this.hashComponents=[
    { title: 'Detail' },
    { title: 'Other' }
  ];
  this.render(hbs`{{mobile/full-screen-footer
    hashComponents=hashComponents
  }}`);
  assert.equal(this.$('[data-test-id="mobile-footer"]').length, 1);
  assert.equal(this.$('[data-test-id="mobile-footer-item"]:eq(0)').text(), 'Detail');
  assert.equal(this.$('[data-test-id="mobile-footer-item"]:eq(1)').text(), 'Other');
});
test('full screen footer is not visible with one section', function(assert) {
  this.hashComponents=[{ title: 'Detail' }];
  this.render(hbs`{{mobile/full-screen-footer
    hashComponents=hashComponents
  }}`);
  assert.equal(this.$('[data-test-id="mobile-footer"]:visible').length, 0);
});
