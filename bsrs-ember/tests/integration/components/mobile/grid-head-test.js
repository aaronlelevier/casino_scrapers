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
    const flexi = this.container.lookup('service:device/layout');
    const breakpoints = flexi.get('breakpoints');
    const width = breakpoints.find(bp => bp.name === 'mobile').begin + 5;
    flexi.set('width', width);
    run(() => {
      store.push('filterset', {'id': '55639133-fd6f-4a03-b7bc-ec2a6a3cb049', 'name': 'ordered by assignee',
      'endpoint_name': 'tickets.index', 'endpoint_uri': '?sort=assignee.fullname', 'created': Date.now() });
    });
  },
});

test('it renders saved filtersets', function(assert) {
  this.grid_title = 'Tickets';
  this.routeName = 'tickets.index';
  this.filtersets = store.find('filterset');
  this.render(hbs`{{grid/helpers/grid-head filtersets=filtersets routeName=routeName grid_title=grid_title}}`);
  assert.ok(this.$('.t-mobile-search > i').hasClass('fa-search'));
  assert.ok(this.$('.t-mobile-filter > i').hasClass('fa-filter'));
  assert.equal(this.$('.t-mobile-grid-title').text().trim(), 'Tickets');
  assert.equal(this.$('hbox div:eq(0) a').text().trim(), 'ordered by assignee');
});

test('clicking filter on a column head column will display an input with no value', function(assert) {
  this.column = { field: 'location.name', isFilterable: true };
  this.gridFilterParams = {};
  this.gridIdInParams = {};
  this.render(hbs`{{grid/helpers/grid-header-column-mobile column=column gridIdInParams=gridIdInParams gridFilterParams=gridFilterParams}}`);
  assert.equal(this.$('input').length, 0);
  this.$('.t-filter-location-name').click();
  assert.equal(this.$('input').length, 1);
  this.$('input').val('dowat').trigger('keyup');
  assert.equal(this.$('input').val(), 'dowat');
  assert.equal(this.gridFilterParams[this.column.field], 'dowat');
});

test('classNameBinding works if toggle mobileFilterInput', function(assert) {
  this.column = { field: 'location.name', isFilterable: true };
  this.gridFilterParams = {};
  this.gridIdInParams = {};
  this.render(hbs`{{grid/helpers/grid-header-column-mobile column=column gridIdInParams=gridIdInParams gridFilterParams=gridFilterParams}}`);
  this.$('hbox').click();
  assert.equal(this.$('.mobile-filter-input').length, 1);
});

test('clicking filter on a column head column will display an input with existing value', function(assert) {
  this.column = { field: 'location.name' };
  this.gridFilterParams = { 'location.name': 'dowat1'};
  this.gridIdInParams = {};
  this.render(hbs`{{grid/helpers/grid-header-column-mobile column=column gridIdInParams=gridIdInParams gridFilterParams=gridFilterParams}}`);
  assert.equal(this.$('input').length, 1);
  assert.equal(this.$('input').val(), 'dowat1');
  this.$('input').val('dowat').trigger('keyup');
  assert.equal(this.$('input').val(), 'dowat');
  assert.equal(this.gridFilterParams[this.column.field], 'dowat');
});

test('if column has filterComponent it is rendered', function(assert) {
  this.column = { field: 'priority.translated_name', isFilterable: true, filterComponent: 'grid/filters/checkbox-list' };
  this.gridFilterParams = {};
  this.gridIdInParams = {};
  this.render(hbs`{{grid/helpers/grid-header-column-mobile column=column gridIdInParams=gridIdInParams gridFilterParams=gridFilterParams}}`);
  assert.equal(this.$('.t-checkbox-list').length, 0);
  this.$('.t-filter-priority-translated-name').click();
  assert.equal(this.$('.t-checkbox-list').length, 1);
});



// test('clicking filter on a column shows a custom filter - priority', function(assert) {
//   this.column = {};
//   this.gridFilterParams = {};
//   this.render(hbs`{{grid/helpers/grid-header-column-mobile column=column gridFilterParams=gridFilterParams}}`);
//   assert.equal(this.$('input').length, 0);
//   this.$('.t-mobile-filter').click();
//   assert.equal(this.$('input').length, 4);
// });
