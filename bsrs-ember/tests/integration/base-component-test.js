import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';

let store, ticket;

moduleForComponent('base-component', 'integration: base-component test', {
  integration: true,
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-status', 'model:model-category']);
    translation.initialize(this);
    this.container.lookup('service:i18n');
    run(() => {
      store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOneKey});
      ticket = store.push('ticket', {id: TD.idOne});
    });
  },
});

test('if btnDisabled as a result of save xhr outstanding, button is disabled', function(assert) {
  this.model = ticket;
  let statuses = store.find('ticket-status');
  this.statuses = statuses;
  this.btnDisabled = true;
  this.render(hbs`{{base-component model=model btnDisabled=btnDisabled}}`);
  assert.equal(this.$('.t-save-btn').attr('disabled'), 'disabled', 'Button is disabled if xhr save is outstanding');
});
