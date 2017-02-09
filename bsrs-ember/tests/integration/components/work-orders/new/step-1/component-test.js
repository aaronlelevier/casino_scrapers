import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import { typeInSearch, clickTrigger, nativeMouseUp } from '../../../../../helpers/ember-power-select';
import waitFor from 'ember-test-helpers/wait';
import CD from 'bsrs-ember/vendor/defaults/category';
import PROVIDER_DEFAULTS from 'bsrs-ember/vendor/defaults/provider';
import WORK_ORDER_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order';

const WD = WORK_ORDER_DEFAULTS.defaults();
const ProviderD = PROVIDER_DEFAULTS.defaults();
const PowerSelect = '.ember-power-select-selected-item';
const DROPDOWN = '.ember-power-select-dropdown';
const TRADE_COMPONENT = '.t-wo-create-trade-select';
const PROVIDER_COMPONENT = '.t-wo-create-provider-select';

let wo, store, trans, work_order_repo;

moduleForComponent('work-orders/new/step-1', 'Integration | Component | work orders/new/step 1', {
  integration: true,
  setup() {
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    store = module_registry(this.container, this.registry);
    run(() => {
      wo = store.push('work-order', { id: WD.idOne, category_fk: CD.idOne });
      store.push('category', { id: CD.idOne, name: CD.nameElectricalChild, verbose_name: CD.nameElectricalChild, workOrders: [WD.idOne] });
    });
    work_order_repo = repository.initialize(this.container, this.registry, 'work-order');
    work_order_repo.findWorkOrderCategory = function() {
      return [
        {id: CD.idOne, name: CD.nameOne, verbose_name: CD.nameOne},
        {id: CD.idTwo, name: CD.nameTwo, verbose_name: CD.nameTwo},
        {id: CD.unusedId, name: CD.nameUnused, verbose_name: CD.nameUnused}
      ];
    };
    work_order_repo.findWorkOrderProvider = function() {
      return [
        {id: ProviderD.idOne, name: ProviderD.nameOne},
        {id: ProviderD.idTwo, name: ProviderD.nameTwo},
        {id: ProviderD.unusedId, name: ProviderD.nameThree}
      ];
    };
  }
});

test('should be able to select new category', function(assert) {
  this.model = wo;
  this.workOrderRepo = work_order_repo;
  this.render(hbs`{{work-orders/new/step-1 
    model=model 
    workOrderRepo=workOrderRepo 
    searchMethod="findWorkOrderCategory"
  }}`);
  clickTrigger(TRADE_COMPONENT);
  run(() => { typeInSearch('a'); });
  return waitFor().
    then(() => {
      assert.equal($(DROPDOWN).length, 1);
      assert.equal($('.ember-power-select-options > li').length, 3);
      nativeMouseUp(`.ember-power-select-option:contains(${CD.nameOne})`);
      assert.equal(this.$().find(`${TRADE_COMPONENT} ${PowerSelect}`).text().trim(), CD.nameOne);
      assert.equal(wo.get('category').get('id'), CD.idOne);
    });
});

test('should be able to select new provider when one doesnt exist', function(assert) {
  this.model = wo;
  this.workOrderRepo = work_order_repo;
  this.render(hbs`{{work-orders/new/step-1 
    model=model 
    workOrderRepo=workOrderRepo 
    searchMethod="findWorkOrderProvider"
  }}`);
  clickTrigger(PROVIDER_COMPONENT);
  run(() => { typeInSearch('a'); });
  return waitFor().
    then(() => {
      assert.equal($(DROPDOWN).length, 1);
      assert.equal($('.ember-power-select-options > li').length, 3);
      nativeMouseUp(`.ember-power-select-option:contains(${ProviderD.nameOne})`);
      assert.equal(this.$().find(`${PROVIDER_COMPONENT} ${PowerSelect}`).text().trim(), ProviderD.nameOne);
      assert.equal(wo.get('provider').get('id'), ProviderD.idOne);
    });
});
