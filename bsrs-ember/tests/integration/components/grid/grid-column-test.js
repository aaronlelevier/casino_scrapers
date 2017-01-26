import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('grid-column', 'integration: grid-column', {
    integration: true
});

test('related property name with underscore will have the correct filterClass, sortByClass and sortClass', function(assert) {
    this.set('column', 'priority.name');
    this.set('prefix', 'ticket.label');
    this.render(hbs`{{grid-column label=(t (t-prefix prefix column)) column=column}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, 3);
    assert.ok($component.find('span:eq(0)').hasClass('t-sort-priority-name'));
    assert.ok($component.find('span:eq(1)').hasClass('t-filter-priority-name'));
    assert.ok($component.find('span:eq(2)').hasClass('t-sort-priority-name-dir'));
});

// test('array based column will have the correct filterClass, sortByClass and sortClass', function(assert) {
//     this.set('column', 'categories[name]');
//     this.set('prefix', 'ticket.label');
//     this.render(hbs`{{grid-column label=(t (t-prefix prefix column)) column=column}}`);
//     let $component = this.$('th');
//     assert.equal($component.length, 1);
//     assert.equal($component.find('span').length, 3);
//     assert.ok($component.find('span:eq(0)').hasClass('t-sort-categories[name]'));
//     assert.ok($component.find('span:eq(1)').hasClass('t-filter-categories[name]'));
//     assert.ok($component.find('span:eq(2)').hasClass('t-sort-categories[name]-dir'));
// });
