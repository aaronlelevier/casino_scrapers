import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('dashboard-add-new', 'Integration | Component | dropdown modal', {
  integration: true
});

test('it renders with top and left attributes', function(assert) {
  this.top = '50px';
  this.left = '150px';
  this.isOpen = true;
  this.render(hbs`{{dashboard-add-new 
    isOpen=isOpen 
    top=top 
    left=left
  }}`);
  assert.equal(this.$('.dashboard-add-new').attr('style'), 'left: 150px;top: 50px;');
  assert.ok(this.$().text().trim().replace(/[\s\n]/gm).includes('ticket.one'));
  assert.ok(this.$().text().trim().replace(/[\s\n]/gm).includes('admin.person.one'));
  assert.ok(this.$().text().trim().replace(/[\s\n]/gm).includes('admin.role.one'));
  assert.ok(this.$().text().trim().replace(/[\s\n]/gm).includes('admin.location.one'));
  assert.ok(this.$().text().trim().replace(/[\s\n]/gm).includes('admin.locationlevel.one'));
  assert.ok(this.$().text().trim().replace(/[\s\n]/gm).includes('admin.category.one'));
  assert.ok(this.$().text().trim().replace(/[\s\n]/gm).includes('tenant.one'));
});

test('it cancels closeTask, keepMeOpen when mouseLeave or mouseEnter', function(assert) {
  assert.expect(3);
  this.isOpen = true;
  this.closeTask = {
    cancelAll: function() {
      assert.ok(true);
    },
    perform: function() {
      assert.ok(true);
    }
  };
  this.keepMeOpen = function() {
    assert.ok(true);
  };
  this.render(hbs`{{dashboard-add-new 
    isOpen=isOpen 
    closeTask=closeTask 
    keepMeOpen=keepMeOpen
  }}`);
  const target = this.$('.dashboard-add-new')[0];
  const mouseEnter = new window.Event('mouseover', { bubbles: true, cancelable: true, view: window });
  run(() => target.dispatchEvent(mouseEnter));
  const mouseLeave = new window.Event('mouseout', { bubbles: true, cancelable: true, view: window });
  run(() => target.dispatchEvent(mouseLeave));
});
