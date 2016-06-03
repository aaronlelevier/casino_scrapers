import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, trans, bp, flexi;

moduleForComponent('grid/grid-head', 'Integration | Component | grid-head', {
  integration: true,
  beforeEach() {
    trans = this.container.lookup('service:i18n');
    store = module_registry(this.container, this.registry, ['model:filterset']);
    flexi = this.container.lookup('service:device/layout');
    let breakpoints = flexi.get('breakpoints');
    bp = {};
    breakpoints.forEach((point) => {
      bp[point.name] = point.begin + 5;
    });
    flexi.set('width', bp.mobile);
    run(() => {
      store.push('filterset', {'id': '55639133-fd6f-4a03-b7bc-ec2a6a3cb049', 'name': 'ordered by assignee',
      'endpoint_name': 'tickets.index', 'endpoint_uri': '?sort=assignee.fullname', 'created': Date.now() });
    });
  },
  afterEach() {
    flexi.set('width', bp.huge);
  }
});

test('it renders and can click on title to show saved filtersets', function(assert) {
  this.grid_title = 'Tickets';
  this.routeName = 'tickets.index';
  this.filtersets = store.find('filterset');
  this.render(hbs`{{grid/helpers/grid-head filtersets=filtersets routeName=routeName grid_title=grid_title}}`);
  assert.ok(this.$('.t-show-save-filterset-modal:eq(0) > i').hasClass('fa-star-o'));
  assert.ok(this.$('.t-show-save-filterset-modal:eq(1) > i').hasClass('fa-search'));
  assert.ok(this.$('.t-show-save-filterset-modal:eq(2) > i').hasClass('fa-filter'));
  assert.equal(this.$('.t-mobile-grid-title').text(), 'Tickets');
  this.$('.t-mobile-grid-title').click();
  assert.equal(this.$('ul > li:eq(0)').text(), 'ordered by assignee');
});

test('can click on filter icon to columns w/ sort and filter options', function(assert) {
  const columns = [{
      field: 'priority.translated_name',
      headerLabel: 'ticket.label.priority-name',
      headerIsTranslatable: true,
      isFilterable: true,
      isSearchable: true,
      templateName: 'tickets/ticket-priority-tag',
      classNames: ['ticket-priority']
    }, { field: 'number',
      headerLabel: 'ticket.label.numberSymbol',
      headerIsTranslatable: true,
      isSortable: true,
      isSearchable: true,
      classNames: ['ticket-number']
    }];
  this.columns = columns;
  this.render(hbs`{{grid/helpers/grid-head columns=columns}}`);
  this.$('.t-mobile-filter').click();
  assert.equal(this.$('.t-sort-number').text(), trans.t('ticket.label.numberSymbol'));
  assert.equal(this.$('th:eq(0)').text().trim(), trans.t('ticket.label.priority-name'));
});
