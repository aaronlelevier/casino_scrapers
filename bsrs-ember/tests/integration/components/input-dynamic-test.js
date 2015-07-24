import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

moduleForComponent('input-dynamic', 'integration: input-dynamic test', {
    integration: true
});

test('renders input with computed value property', function(assert) {
    var obj = Ember.Object.create({
        text: null
    });
    var prop = 'text';
    this.set('obj', obj);
    this.set('prop', prop);

    this.render(hbs`{{input-dynamic prop=prop obj=obj}}`);

    assert.equal(this.$('.t-new-entry').val(), '');

    this.$('.t-new-entry').val('andier');
    assert.equal(this.$('.t-new-entry').val(), 'andier');
});
