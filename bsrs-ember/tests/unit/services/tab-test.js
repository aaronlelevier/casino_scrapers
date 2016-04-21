import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import DTD from 'bsrs-ember/vendor/defaults/dtd';

var ticket, dtd, store, tab, tab_single;

moduleFor('service:tab-list', 'Unit | Service | tab list', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:ticket', 'model:tab-single', 'model:tab', 'model:dtd', 'model:dtd-list', 'service:i18n']);
    ticket = store.push('ticket', {id: TD.idOne});
    dtd = store.push('dtd', {id: DTD.idOne});
    tab = store.push('tab', {id: TD.idOne, module: 'ticket', tabType: 'multiple', redirectRoute: 'tickets.index'});
    tab_single = store.push('tab-single', {id: DTD.idOne, module: 'dtd', moduleList: 'dtd-list', tabType: 'single', closeTabRedirect: 'admin', deleteRedirect: 'dtds.index'});
  }
});

/*
 * findTabByType: used to get tab that is passed to application route
 */
test('it exists for multiple tabs', function(assert) {
  let service = this.subject();
  assert.equal(service.findTabByType(TD.idOne).get('id'), TD.idOne);
});

test('it exists for single tabs', function(assert) {
  let service = this.subject();
  assert.equal(service.findTabByType(DTD.idOne, 'single').get('id'), DTD.idOne);
});

/*
 * redirectRoute: will determine where to redirect to based on action
 * if all three actions redirect to same route, just declare the `redirectRoute` on the route for the module
 * redirect should handle going back to route before entering the tab
 * before entering route, should log location with each tab that exists in the willDestroyElement hook of the detail component
 * if tabs previous route is not the same as the `module` property, then transition to that route
 */
test('redirects based on action', function(assert) {
  let service = this.subject();
  const tab = service.findTabByType(TD.idOne, 'multiple');
  const route = service.redirectRoute(tab, 'tickets.ticket', 'closeTab'); 
  assert.equal(route, 'tickets.index');
  const tab_dtd = service.findTabByType(DTD.idOne, 'single');
  let route_dtd = service.redirectRoute(tab_dtd, 'dtds.dtd', 'closeTab'); 
  assert.equal(route_dtd, 'admin');
  route_dtd = service.redirectRoute(tab_dtd, 'dtds.dtd', 'delete'); 
  assert.equal(route_dtd, 'dtds.index');
  run(() => {
    store.push('tab-single', {id: DTD.idOne, previousLocation: 'person.index'});
  });
  route_dtd = service.redirectRoute(tab_dtd, 'dtds.dtd', 'delete'); 
  assert.equal(route_dtd, 'person.index');
});

test('log location will update all tabs previousLocation property', function(assert) {
  let service = this.subject();
  assert.equal(tab.get('previousLocation'), undefined);
  assert.equal(tab_single.get('previousLocation'), undefined);
  service.logLocation('people.index');
  assert.equal(tab.get('previousLocation'), 'people.index');
  assert.equal(tab_single.get('previousLocation'), 'people.index');
});

test('isDirty will return a boolean to tell modal to show', function(assert) {
  let service = this.subject();
  const tab = service.findTabByType(TD.idOne, 'multiple');
  assert.notOk(service.isDirty(tab), 'closeTab');
  ticket.set('request', 'wat');
  assert.ok(service.isDirty(tab, 'closeTab'));
  const tab_dtd = service.findTabByType(DTD.idOne, 'single');
  assert.notOk(service.isDirty(tab_dtd, 'delete'));
  dtd.set('key', '456');
  assert.ok(service.isDirty(tab_dtd, 'delete'));
  dtd.save();
  let dtd_2;
  run(() => {
    dtd_2 = store.push('dtd-list', {id: DTD.idTwo});
    store.push('dtd', {id: DTD.idTwo});
    store.push('dtd-list', {id: DTD.idOne});
  });
  assert.notOk(service.isDirty(tab_dtd, 'closeTab'));
  run(() => {
    store.push('dtd', {id: DTD.idOne, key: DTD.keyOne});
  });
  assert.ok(service.isDirty(tab_dtd, 'closeTab'));
  dtd.save();
  assert.notOk(service.isDirty(tab_dtd, 'closeTab'));
  run(() => {
    store.push('dtd', {id: DTD.idTwo, key: DTD.keyOne});
  });
  assert.ok(dtd_2.get('isDirtyOrRelatedDirty'));
  assert.ok(service.isDirty(tab_dtd, 'closeTab'));
});
