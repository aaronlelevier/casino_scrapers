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
    run(() => {
      flexi.set('width', bp.huge);
    });
  }
});

test('it renders saved filtersets', function(assert) {
  this.grid_title = 'Tickets';
  this.routeName = 'tickets.index';
  this.filtersets = store.find('filterset');
  this.render(hbs`{{grid/helpers/grid-head filtersets=filtersets routeName=routeName grid_title=grid_title}}`);
  assert.ok(this.$('.t-saved-filtersets > i').hasClass('fa-star-o'));
  assert.ok(this.$('.t-mobile-search > i').hasClass('fa-search'));
  assert.ok(this.$('.t-mobile-filter > i').hasClass('fa-filter'));
  assert.equal(this.$('.t-mobile-grid-title').text().trim(), 'Tickets');
  assert.equal(this.$('hbox > div:eq(0)').text(), 'ordered by assignee');
});

test('it renders search grid when clicked and can toggle on and off', function(assert) {
  this.grid_title = 'Tickets';
  this.routeName = 'tickets.index';
  this.filtersets = store.find('filterset');
  this.render(hbs`{{grid/helpers/grid-head filtersets=filtersets routeName=routeName grid_title=grid_title}}`);
  this.$('.t-mobile-search').click();
  assert.equal(this.$('.t-mobile-search-wrap').length, 1);
  this.$('.t-mobile-search').click();
  assert.equal(this.$('.t-mobile-search-wrap').length, 0);
});
