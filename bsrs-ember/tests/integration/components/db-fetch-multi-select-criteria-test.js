import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import { clickTrigger, nativeMouseUp, nativeMouseDown, typeInSearch } from '../../helpers/ember-power-select';
import repository from 'bsrs-ember/tests/helpers/repository';
import waitFor from 'ember-test-helpers/wait';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import SD from 'bsrs-ember/vendor/defaults/state';

const DROPDOWN = '.ember-power-select-dropdown';

var store, pfilter, results, state_repo, component;

moduleForComponent('db-fetch-multi-select-criteria', 'Integration | Component | db-fetch-multi-select-criteria automation profile criteria', {
  integration: true,
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:pfilter', 'model:criteria', 'model:state']);
    translation.initialize(this);
    this.container.lookup('service:i18n');
    run(() => {
      pfilter = store.push('pfilter', {id: PFD.idOne, source_id: PFD.sourceIdOne, key: PFD.keyOne, field: PFD.fieldOne, criteria: [{id: SD.id, name: SD.name}], lookups: {}});
      // ticket-priorities
      store.push('state', {id: SD.id, name: SD.name});
    });
    state_repo = repository.initialize(this.container, this.registry, 'state-db-fetch');
    results = [
      {id: SD.id, name: SD.name},
      {id: SD.idTwo, name: SD.nameTwo},
    ];
    state_repo.findState = () => new Ember.RSVP.Promise((resolve) => {
      resolve(results);
    });
    component = hbs `{{
      db-fetch-multi-select-criteria
      model=model
      className="t-ticket-state-select"
      placeholder="admin.placeholder.available_filter.state"
      repository=repository
      searchMethod="findState"
    }}`;
  }
});

test('placeholder', function(assert) {
  this.model = pfilter;
  this.render(component);
  assert.equal(this.$('.ember-power-select-trigger-multiple-input').length, 1);
  assert.equal(this.$('.ember-power-select-trigger-multiple-input:eq(0)').get(0)['placeholder'], 'admin.placeholder.available_filter.state');
});

test('add and remove a criteria; also shows display name, which is the _name_ field, can be selected', function(assert) {
  this.model = pfilter;
  this.repository = state_repo;
  this.render(component);
  assert.equal(this.$('.ember-power-select-multiple-option').length, 0);
  clickTrigger();
  run(() => { typeInSearch('c'); });
  return waitFor().then(() => {
    assert.equal(this.$(DROPDOWN).length, 1);
    assert.equal(this.$('.ember-power-select-options > li').length, 2);
    assert.equal(this.$('.ember-power-select-multiple-option').length, 0);
    nativeMouseUp(`.ember-power-select-option:contains(${SD.name})`);
    assert.equal(this.$('.ember-power-select-multiple-option').length, 1);
    nativeMouseDown('.ember-power-select-multiple-remove-btn');
    assert.equal(this.$('.ember-power-select-multiple-option').length, 0);
  });
});
