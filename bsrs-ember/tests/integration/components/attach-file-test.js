import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';

let store, run = Ember.run;

moduleForComponent('attach-file', 'integration: attach-file', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:attachment']);
    }
});

test('progress bar should transform from green to blue once upload is complete', function(assert) {
    assert.expect(5);
    let attachment = store.push('attachment', {id: 7, percent: 25, new: true});
    let ticket = store.push('ticket', {id: TD.idOne, ticket_attachments_fks: [7], previous_attachments_fks: []});
    this.set('model', ticket);
    this.render(hbs`{{attach-file model=model}}`);
    let $component = this.$('.progress-bar');
    assert.equal($component.length, 1);
    assert.ok($component.hasClass('progress-bar-success'));
    assert.ok($component.hasClass('progress-bar'));
    run(() => { attachment.set('percent', 100); });
    setTimeout(function() {
        assert.ok($component.hasClass('progress-bar'));
        assert.ok(!$component.hasClass('progress-bar-success'));
    });
});
