import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
// import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import DTD from 'bsrs-ember/vendor/defaults/dtd';

let store, dtd, dtd_repo;

moduleForComponent('dtds/dtd-single', 'integration: dtd-single test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:dtd']);
        run(() => {
            dtd = store.push('dtd', {});
        });
        dtd_repo = repository.initialize(this.container, this.registry, 'dtd');
        dtd_repo.update = () => { return new Ember.RSVP.Promise(() => {}); };
    }
});

test('validation works as expected', function(assert) {
    let statuses = store.find('dtd-status');
    this.set('model', dtd);
    this.render(hbs`{{dtds/dtd-single model=model}}`);
    let $component = this.$('.t-dtd-key-error');
    var save_btn = this.$('.t-save-btn');
    save_btn.trigger('click').trigger('change');
    assert.ok($component.is(':visible'));
    this.$('.t-dtd-key').val('a').trigger('change');
    assert.equal($component.text().trim(), 'Key must be provided');
});

test('dtd links', function(assert) {
    let links = store.find('link');
    run(() => {
        dtd = store.push('dtd', {id: 1});
    });
    this.set('model', dtd);
    this.render(hbs`{{dtds/dtd-single model=model}}`);
    let $component = this.$('.t-input-multi-dtd-link');
    assert.ok($component.is(':visible'));
    var add_btn = this.$('.t-add-link-btn');
    add_btn.trigger('click').trigger('change');
    assert.equal($component.find('.t-dtd-link-request').get('length'), 1);
    assert.equal($component.find('.t-dtd-link-text').get('length'), 1);
    assert.equal($component.find('.t-dtd-link-action_button').get('length'), 1);
    assert.equal($component.find('.t-dtd-link-is_header').get('length'), 1);
    assert.equal($component.find('.t-ticket-priority-select').get('length'), 1);
    assert.equal($component.find('.t-ticket-status-select').get('length'), 1);
});
