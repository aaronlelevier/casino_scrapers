import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import TICKET_CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/model-category';
import repository from 'bsrs-ember/tests/helpers/repository';

let store, m2m, m2m_two, m2m_three, ticket, category_one, category_two, category_three, run = Ember.run, category_repo;
const CATEGORY_ONE = '.t-model-category-select:eq(0) > .ember-basic-dropdown-trigger';
const CATEGORY_TWO = '.t-model-category-select:eq(1) > .ember-basic-dropdown-trigger';
const CATEGORY_THREE = '.t-model-category-select:eq(2) > .ember-basic-dropdown-trigger';

moduleForComponent('tickets/ticket-new', 'integration: ticket-new test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-status']);
    translation.initialize(this);
    run(function() {
      m2m = store.push('model-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, model_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne});
      m2m_two = store.push('model-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, model_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idTwo});
      m2m_three = store.push('model-category', {id: TICKET_CATEGORY_DEFAULTS.idThree, model_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.unusedId});
      category_one = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, parent_id: CATEGORY_DEFAULTS.idTwo});
      category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent_id: CATEGORY_DEFAULTS.unusedId});
      category_three = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameThree, parent_id: null});
    });
    const flexi = this.container.lookup('service:device/layout');
    let breakpoints = flexi.get('breakpoints');
    let bp = {};
    breakpoints.forEach((point) => {
      bp[point.name] = point.begin + 5;
    });
    run(() => {
      flexi.set('width', bp.desktop);
    });
  }
});

test('each status shows up as a valid select option', function(assert) {
  run(function() {
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusTwo});
    ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
  });
  let statuses = store.find('ticket-status');
  this.set('model', ticket);
  this.set('statuses', statuses);
  this.render(hbs`{{tickets/ticket-new model=model statuses=statuses}}`);
  let $component = this.$('.t-ticket-status-select');
  assert.equal($component.length, 1);
});

test('each priority shows up as a valid select option', function(assert) {
  run(function() {
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne});
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityTwoId, name: TICKET_DEFAULTS.priorityTwo});
    ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
  });
  let priorities = store.find('ticket-priority');
  this.set('model', ticket);
  this.set('priorities', priorities);
  this.render(hbs`{{tickets/ticket-new model=model priorities=priorities}}`);
  let $component = this.$('.t-ticket-priority-select');
  assert.equal($component.length, 1);
});

test('only one select is rendered when ticket has no categories (and no top level options yet resolved)', function(assert) {
  let top_level_category_options = Ember.A([]);
  run(function() {
    ticket = store.push('ticket', {id: TICKET_DEFAULTS.unusedId});
  });
  this.set('model', ticket);
  this.set('top_level_category_options', top_level_category_options);
  this.render(hbs`{{tickets/ticket-new model=model top_level_category_options=top_level_category_options}}`);
  let $component = this.$('.t-model-category-select');
  assert.equal(ticket.get('categories').get('length'), 0);
  assert.equal($component.length, 1);
  assert.equal($component.find('div.item').length, 0);
  assert.equal($component.find('div.option').length, 0);
});
