import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

let store;

moduleForComponent('mobile/full-screen', 'amk Integration | Component | full-screen-footer', {
  integration: true,
  beforeEach() {
    const flexi = this.container.lookup('service:device/layout');
    const breakpoints = flexi.get('breakpoints');
    const width = breakpoints.find(bp => bp.name === 'mobile').begin + 5;
    flexi.set('width', width);
  },
});

test('full screen footer renders with multiple footer items', function(assert) {
  this.hashComponents=[
    {
      title: 'Detail'
    },
    {
      title: 'Other'
    }
  ];
  this.render(hbs`{{mobile/full-screen-footer
    hashComponents=hashComponents
  }}`);
  assert.equal(this.$('[data-test-id="mobile-footer"]').length, 1);
  assert.equal(this.$('[data-test-id="mobile-footer-item"]:eq(0)').text(), 'Detail');
  assert.equal(this.$('[data-test-id="mobile-footer-item"]:eq(1)').text(), 'Other');
});
test('full screen footer is not visible with one section', function(assert) {
  this.hashComponents=[
    {
      title: 'Detail'
    }
  ];
  this.render(hbs`{{mobile/full-screen-footer
    hashComponents=hashComponents
  }}`);
  assert.equal(this.$('[data-test-id="mobile-footer"]:visible').length, 0);
});
