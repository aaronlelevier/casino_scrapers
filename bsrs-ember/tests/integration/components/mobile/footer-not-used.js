import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, ticket, trans, bp, flexi;

moduleForComponent('grid/grid-footer', 'Integration | Component | grid-footer', {
  integration: true,
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:ticket']);
    run(() => {
      ticket = store.push('ticket', {id: TD.idOne, count: 10});
    });
    flexi = this.container.lookup('service:device/layout');
    let breakpoints = flexi.get('breakpoints');
    bp = {};
    breakpoints.forEach((point) => {
      bp[point.name] = point.begin + 5;
    });
    run(() => {
      flexi.set('width', bp.mobile);
    });
  },
});

test('it renders page selector', function(assert) {
  this.model = ticket;
  this.list_url = 'tickets.index';
  this.page = 1;
  this.render(hbs`{{grid/helpers/grid-footer model=model page=page list_url=list_url}}`);
  assert.equal(this.$('.t-pages').length, 1);
  assert.equal(this.$('.t-previous').length, 1);
  assert.equal(this.$('.t-next').length, 1);
  assert.equal(this.$('.t-pages li').length, 2);
});
