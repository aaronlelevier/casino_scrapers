import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('oxford-comma', 'Integration | Component | oxford comma', {
  integration: true,
  beforeEach() {
    this.linkto = 'admin.people.person';
    this.prop = 'fullname';
    this.classItem = 't-item';
  }
});

test('it renders with multiple items', function(assert) {
  this.array = [ { id: 1, fullname: 'wat' }, { id: 2, fullname: 'foo' }, { id: 3, fullname: 'bar' } ];
  this.className = 't-wat';
  this.render(hbs`{{oxford-comma 
    class=className
    array=array 
    linkto=linkto 
    prop=prop
    classItem=classItem
  }}`);
  assert.equal(this.$().text().trim().replace(/\s/g, ''), 'wat,foo,general.andbar');
  assert.equal(this.$('.t-item0').text(), 'wat');
  assert.equal(this.$('.t-item1').text(), 'foo');
  assert.equal(this.$('.t-item2').text(), 'bar');
  assert.equal(document.getElementsByClassName('t-wat')[0].tagName, 'SPAN');
});

test('it renders with two items', function(assert) {
  this.array = [ { id: 1, fullname: 'wat' }, { id: 2, fullname: 'foo' } ];
  this.render(hbs`{{oxford-comma 
    array=array 
    linkto=linkto 
    prop=prop
    classItem=classItem
  }}`);
  assert.equal(this.$().text().trim().replace(/\s/g, ''), 'watgeneral.andfoo');
});

test('it renders with one item', function(assert) {
  this.array = [ { id: 1, fullname: 'wat' } ];
  this.render(hbs`{{oxford-comma 
    array=array 
    linkto=linkto 
    prop=prop
    classItem=classItem
  }}`);
  assert.equal(this.$().text().trim().replace(/\s/g, ''), 'wat');
});

test('it renders with zero items', function(assert) {
  this.array = [];
  this.render(hbs`{{oxford-comma 
    array=array 
    linkto=linkto 
    prop=prop
    classItem=classItem
  }}`);
  assert.equal(this.$().text().trim().replace(/\s/g, ''), '');
});
