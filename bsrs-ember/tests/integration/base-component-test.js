import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';

let store, ticket, trans;

moduleForComponent('base-component', 'integration: base-component test', {
  integration: true,
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-status', 'model:model-category']);
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
    run(() => {
      store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOneKey});
      ticket = store.push('ticket', {id: TD.idOne});
    });
  },
});

test('no delete button if existing record, only show if new:true', function(assert) {
  this.model = ticket;
  let statuses = store.find('ticket-status');
  this.statuses = statuses;
  this.render(hbs`{{base-component model=model}}`);
  assert.equal(this.$('.t-delete-btn').text().trim(), trans.t('crud.delete.button'), 'Delete btn shows');
  run(() => {
    store.push('ticket', {id: TD.idOne, new: true});
  });
  this.render(hbs`{{tickets/ticket-single model=model statuses=statuses activities=statuses}}`);
  assert.equal(this.$('.t-delete-btn').text().trim(), '', 'Delete btn does not show');
});
