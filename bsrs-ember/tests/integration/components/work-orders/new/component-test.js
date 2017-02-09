import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import hbs from 'htmlbars-inline-precompile';
import repository from 'bsrs-ember/tests/helpers/repository';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import { typeInSearch, clickTrigger, nativeMouseUp } from '../../../../helpers/ember-power-select';
import waitFor from 'ember-test-helpers/wait';
import WORK_ORDER_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order';
import WORK_ORDER_STATUS_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order-status';
import PROVIDER_DEFAULTS from 'bsrs-ember/vendor/defaults/provider';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import CD from 'bsrs-ember/vendor/defaults/category';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';
import moment from 'moment';

const WD = WORK_ORDER_DEFAULTS.defaults();
const WODS = WORK_ORDER_STATUS_DEFAULTS.defaults();
const ProviderD = PROVIDER_DEFAULTS.defaults();
const PowerSelect = '.ember-power-select-selected-item';
const DROPDOWN = '.ember-power-select-dropdown';
const TRADE_COMPONENT = '.t-wo-create-trade-select';
const PROVIDER_COMPONENT = '.t-wo-create-provider-select';

let trans, store, model;

moduleForComponent('work-orders/new', 'Integration | Component | work orders/new', {
  integration: true,
  beforeEach() {
    store = module_registry(this.container, this.registry);
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
    run(() => {
      model = store.push('work-order', { id: WD.idOne, cost_estimate: WD.costEstimateOne, scheduled_date: WD.scheduledDateOne, cost_estimate_currency: CurrencyD.idOne,
        status_fk: WODS.idOne, category_fk: CD.idOne });
      /* Setup WO with currency and status and category but not provider */
      store.push('currency', {id: CurrencyD.idOne, workOrders: [WD.idOne]});
      store.push('work-order-status', {id: WODS.idOne, name: WODS.nameOne, workOrders: [WD.idOne, WD.idTwo]});
      store.push('category', { id: CD.idOne, name: CD.nameElectricalChild, verbose_name: CD.nameElectricalChild, workOrders: [WD.idOne], cost_amount: CD.costAmountOne });
    });
    const work_order_repo = repository.initialize(this.container, this.registry, 'work-order');
    work_order_repo.findWorkOrderProvider = function() {
      return [
        {id: ProviderD.idOne, name: ProviderD.nameOne},
        {id: ProviderD.idTwo, name: ProviderD.nameTwo},
        {id: ProviderD.unusedId, name: ProviderD.nameThree}
      ];
    };
  }
});

test('it renders with status-tracker, btns, and step-1 components', function(assert) {
  this.model = model;
  this.render(hbs`{{work-orders/new model=model}}`);
  assert.equal(this.$('.t-buttons').length, 1);
  assert.equal(this.$('.t-status-tracker').length, 1);
  assert.equal(this.$('[data-test-id="work-order-header"]').text().trim(), trans.t('work_order.new'));
});

test('it renders with cancel action', function(assert) {
  assert.expect(1);
  this.model = model;
  this.cancel = function() {
    assert.ok(true);
  };
  this.render(hbs`{{work-orders/new model=model cancel=cancel}}`);
  this.$('[data-test-id="cancel"]').click();
});


test('if model is not valid in step-1, then next btn is disabled', function(assert) {
  this.model = model;
  this.render(hbs`{{work-orders/new model=model}}`);
  assert.equal(this.$('[data-test-id="next"]').attr('disabled'), 'disabled');
});

test('work order category shows up based on ticket category leaf (default state step-1)', function(assert) {
  this.model = model;
  this.render(hbs`{{work-orders/new model=model}}`);
  assert.equal(this.$(`${TRADE_COMPONENT} ${PowerSelect}`).text().trim(), CD.nameElectricalChild);
  assert.equal(model.get('category').get('id'), CD.idOne);
});

test('can click on same step and not do anything', function(assert) {
  this.model = model;
  this.render(hbs`{{work-orders/new model=model}}`);
  assert.equal(this.$('[data-test-id="next"]').attr('disabled'), 'disabled');
  assert.equal(this.$(`${TRADE_COMPONENT} ${PowerSelect}`).text().trim(), CD.nameElectricalChild);
  this.$('[data-test-id="step1"]').click();
  assert.equal(this.$('[data-test-id="next"]').attr('disabled'), 'disabled');
  assert.equal(this.$(`${TRADE_COMPONENT} ${PowerSelect}`).text().trim(), CD.nameElectricalChild);
});

test('next button is not shown until select provider (step-1)', function(assert) {
  this.model = model;
  this.render(hbs`{{work-orders/new model=model}}`);
  assert.equal(this.$('[data-test-id="next"]').attr('disabled'), 'disabled');

  clickTrigger(PROVIDER_COMPONENT);
  run(() => { typeInSearch('a'); });
  return waitFor().
    then(() => {
      assert.equal($(DROPDOWN).length, 1);
      assert.equal($('.ember-power-select-options > li').length, 3);
      nativeMouseUp(`.ember-power-select-option:contains(${ProviderD.nameOne})`);
      assert.equal(this.$(`${PROVIDER_COMPONENT} ${PowerSelect}`).text().trim(), ProviderD.nameOne);
      assert.equal(model.get('provider').get('id'), ProviderD.idOne);
      assert.equal(this.$('[data-test-id="next"]').attr('disabled'), undefined, 'not disabled b/c selected provider in step-1');
    });
});

test('step2 removing either approved amount or scheduled date will disable next and step3 buttons', function(assert) {
  run(() => {
    store.push('work-order', { id: WD.idOne, approved_amount: CD.costAmountOne, category_fk: CD.idOne, provider_fk: ProviderD.idOne });
    store.push('provider', { id: ProviderD.idOne, name: ProviderD.nameOne, workOrders: [WD.idOne] });
  });
  this.model = model;
  this.render(hbs`{{work-orders/new model=model}}`);
  assert.equal(this.$('[data-test-id="next"]').attr('disabled'), undefined, 'not disabled b/c has cat and provider');

  this.$('[data-test-id="next"]').click();

  /* STEP 2 */
  assert.equal(this.$('[data-test-id="next"]').attr('disabled'), undefined, 'next has both approved_amount and scheduled_date');
  assert.equal(this.$('[data-test-id="step3"]').attr('disabled'), undefined, 'step3 has both approved_amount and scheduled_date');
  this.$('.t-wo-approved_amount').val('').trigger('change');
  assert.equal(this.$('[data-test-id="next"]').attr('disabled'), 'disabled', 'next is disabled if remove one property from step2');
  assert.equal(this.$('[data-test-id="step3"]').attr('disabled'), 'disabled', 'step3 is disabled if remove one property from step2');
  this.$('.t-wo-approved_amount').val('100').trigger('change');
  assert.equal(this.$('[data-test-id="next"]').attr('disabled'), undefined, 'has both approved_amount and scheduled_date');
  assert.equal(this.$('[data-test-id="step3"]').attr('disabled'), undefined, 'step3 is disabled if remove one property from step2');

  run(() => {
    // cant find a way to clear out scheduled_date in integration test land
    store.push('work-order', { id: WD.idOne, scheduled_date: null });
  });

  assert.equal(this.$('[data-test-id="next"]').attr('disabled'), 'disabled', 'next is disabled if remove one property from step2');
  assert.equal(this.$('[data-test-id="step3"]').attr('disabled'), 'disabled', 'step3 is disabled if remove one property from step2');
});

test('transitions to step-2 when click next and can click back and next btn is not disabled', function(assert) {
  run(() => {
    store.push('work-order', { id: WD.idOne, category_fk: CD.idOne, provider_fk: ProviderD.idOne });
    store.push('provider', { id: ProviderD.idOne, name: ProviderD.nameOne, workOrders: [WD.idOne] });
  });
  this.model = model;
  this.render(hbs`{{work-orders/new model=model}}`);
  assert.equal(this.$('[data-test-id="next"]').attr('disabled'), undefined, 'not disabled b/c has cat and provider');

  this.$('[data-test-id="next"]').click();

  /* STEP 2 */
  assert.equal(this.$('[data-test-id="next"]').attr('disabled'), 'disabled', 'is disabled if remove one property from step2');

  assert.equal(model.get('category').get('id'), CD.idOne);
  assert.equal(model.get('provider').get('id'), ProviderD.idOne, 'model provider hasnt changed');
  assert.equal(model.get('provider').get('approved_amount'), undefined, 'still havent filled out approved_amount');

  /* CHECK CLASSES ON STATUS TRACKER */
  assert.ok(this.$('[data-test-id="item1"]').hasClass('timeline__item--completed'), 'completed class');
  assert.notOk(this.$('[data-test-id="item1"]').hasClass('timeline__item--active'), 'no active class bc transitioned to step2');
  assert.ok(this.$('[data-test-id="item2"]').hasClass('timeline__item--active'), 'active class b/c transitioned to step2');
  assert.notOk(this.$('[data-test-id="item3"]').hasClass('timeline__item--active'), 'no active class for step3');

  this.$('[data-test-id="back"]').click();

  /* STEP 1 */
  assert.equal(this.$('[data-test-id="next"]').attr('disabled'), undefined, 'model is valid so can click to step-2');
  assert.equal(this.$(`${PROVIDER_COMPONENT} ${PowerSelect}`).text().trim(), ProviderD.nameOne, 'provider unchanged');
  assert.equal(model.get('provider').get('id'), ProviderD.idOne);

  /* CHECK CLASSES ON STATUS TRACKER */
  assert.ok(this.$('[data-test-id="item1"]').hasClass('timeline__item--active'), 'active class');
  assert.notOk(this.$('[data-test-id="item1"]').hasClass('timeline__item--completed'), 'no completed class when transition back');
});

test('transitions to step-2 when click step2 in status-tracker component', function(assert) {
  run(() => {
    store.push('work-order', { id: WD.idOne, category_fk: CD.idOne, provider_fk: ProviderD.idOne });
    store.push('provider', { id: ProviderD.idOne, name: ProviderD.nameOne, workOrders: [WD.idOne] });
  });
  this.model = model;
  this.render(hbs`{{work-orders/new model=model}}`);

  /* OK to transition to step2 */
  assert.equal(this.$('[data-test-id="step2"]').attr('disabled'), undefined, 'can transition to step2 b/c have cat and provider');
  assert.equal(this.$('[data-test-id="next"]').attr('disabled'), undefined);
  assert.equal(this.$(`${PROVIDER_COMPONENT} ${PowerSelect}`).text().trim(), ProviderD.nameOne);

  this.$('[data-test-id="step2"]').click();

  /* STEP 2 */
  assert.equal(this.$('[data-test-id="step1"]').attr('disabled'), undefined, 'step1 is enabled still');
  assert.equal(this.$('[data-test-id="step2"]').attr('disabled'), undefined, 'status tracker action will no-op if on same state');
  assert.equal(this.$('[data-test-id="step3"]').attr('disabled'), 'disabled', 'step3 disabled because havent filled out scheduled_date or approved_amount');
  assert.equal(this.$('[data-test-id="next"]').attr('disabled'), 'disabled', 'next disabled because havent filled out scheduled_date or approved_amount');
  assert.equal(this.$('.t-wo-approved_amount').val(), '');

  assert.equal(model.get('category').get('id'), CD.idOne);
  assert.equal(model.get('provider').get('id'), ProviderD.idOne, 'model provider hasnt changed');
  assert.equal(model.get('approved_amount'), undefined);

  this.$('[data-test-id="step1"]').click();

  /* STEP 1 */
  assert.equal(this.$('[data-test-id="step1"]').attr('disabled'), undefined, 'status tracker action will no-op if on same state');
  assert.equal(this.$('[data-test-id="step2"]').attr('disabled'), undefined);
  assert.equal(this.$(`${PROVIDER_COMPONENT} ${PowerSelect}`).text().trim(), ProviderD.nameOne, 'model provider has not changed after navigate back to step-1');
  assert.equal(model.get('provider').get('id'), ProviderD.idOne);
});

test('OVERALL - can click through to final step', function(assert) {
  run(() => {
    store.push('work-order', { id: WD.idOne, approved_amount: CD.costAmountOne });
  });
  this.model = model;
  this.render(hbs`{{work-orders/new model=model}}`);

  /* STEP 1 */
  /* NOT OK to transition to step2 */
  assert.equal(this.$('[data-test-id="step3"]').attr('disabled'), 'disabled');
  assert.equal(this.$('[data-test-id="step2"]').attr('disabled'), 'disabled');
  assert.equal(this.$('[data-test-id="step1"]').attr('disabled'), undefined);
  assert.equal(this.$('[data-test-id="next"]').attr('disabled'), 'disabled');
  assert.equal(this.$(`${PROVIDER_COMPONENT} ${PowerSelect}`).text().trim(), '');
  assert.equal(model.get('category').get('id'), CD.idOne);
  assert.equal(model.get('approved_amount'), CD.costAmountOne);

  /* CHECK CLASSES ON STATUS TRACKER */
  assert.ok(this.$('[data-test-id="item1"]').hasClass('timeline__item--active'), 'active class');
  assert.notOk(this.$('[data-test-id="item1"]').hasClass('timeline__item--completed'), 'no completed class on initial render');
  assert.notOk(this.$('[data-test-id="item2"]').hasClass('timeline__item--active'), 'ensuring no active class');
  assert.notOk(this.$('[data-test-id="item2"]').hasClass('timeline__item--completed'), 'no completed class on step2 yet');
  assert.notOk(this.$('[data-test-id="item3"]').hasClass('timeline__item--active'), 'ensuring no active class');
  assert.notOk(this.$('[data-test-id="item3"]').hasClass('timeline__item--completed'), 'no completed class on step3 yet');

  clickTrigger(PROVIDER_COMPONENT);
  run(() => { typeInSearch('a'); });
  return waitFor().
    then(() => {
      assert.equal($(DROPDOWN).length, 1);
      assert.equal($('.ember-power-select-options > li').length, 3);
      // clicked provider
      nativeMouseUp(`.ember-power-select-option:contains(${ProviderD.nameOne})`);
      assert.equal(this.$(`${PROVIDER_COMPONENT} ${PowerSelect}`).text().trim(), ProviderD.nameOne);
      assert.equal(model.get('provider').get('id'), ProviderD.idOne);

      assert.equal(this.$('[data-test-id="step3"]').attr('disabled'), undefined, 'not disabled because step2 has defaults');
      assert.equal(this.$('[data-test-id="step2"]').attr('disabled'), undefined, 'step2 btn enabled after filling in provider');
      assert.equal(this.$('[data-test-id="step1"]').attr('disabled'), undefined);
      assert.equal(this.$('[data-test-id="next"]').attr('disabled'), undefined);
      assert.equal(this.$(`${PROVIDER_COMPONENT} ${PowerSelect}`).text().trim(), ProviderD.nameOne);
      assert.equal(model.get('approved_amount'), CD.costAmountOne);

      this.$('[data-test-id="next"]').click();

      /* STEP 2 */
      assert.equal(this.$('[data-test-id="step1"]').attr('disabled'), undefined, 'step1 is enabled still');
      assert.equal(this.$('[data-test-id="step2"]').attr('disabled'), undefined, 'status tracker action will no-op if on same state');
      assert.equal(this.$('[data-test-id="step3"]').attr('disabled'), undefined, 'not disabled b/c step2 has defaults');
      assert.equal(this.$('[data-test-id="next"]').attr('disabled'), undefined, 'step2 has defaults');
      assert.equal(this.$('.t-wo-approved_amount').val(), CD.costAmountOne, 'work order should have defaulted approved amount from leaf category');
      assert.equal(this.$('.t-scheduled-date').val(), moment(WD.scheduledDateOne).format('MM/DD/YYYY'), 'work order should come with defaulted date');
      assert.equal(model.get('approved_amount'), CD.costAmountOne);

      assert.equal(model.get('provider').get('id'), ProviderD.idOne, 'model provider hasnt changed');

      /* CHECK CLASSES ON STATUS TRACKER */
      assert.notOk(this.$('[data-test-id="item1"]').hasClass('timeline__item--active'), 'active class');
      assert.ok(this.$('[data-test-id="item1"]').hasClass('timeline__item--completed'), 'no completed class on initial render');
      assert.ok(this.$('[data-test-id="item2"]').hasClass('timeline__item--active'), 'active class on step2');
      assert.notOk(this.$('[data-test-id="item2"]').hasClass('timeline__item--completed'), 'no completed class on step2 yet');
      assert.notOk(this.$('[data-test-id="item3"]').hasClass('timeline__item--active'), 'ensuring no active class');
      assert.notOk(this.$('[data-test-id="item3"]').hasClass('timeline__item--completed'), 'no completed class on step3 yet');

      this.$('.t-wo-approved_amount').val('23').trigger('change');

      assert.equal(this.$('[data-test-id="step1"]').attr('disabled'), undefined, 'step1 is enabled still');
      assert.equal(this.$('[data-test-id="step2"]').attr('disabled'), undefined, 'status tracker action will no-op if on same state');
      assert.equal(this.$('[data-test-id="step3"]').attr('disabled'), undefined, 'can go to step3 because bot properties are defaulted');
      assert.equal(this.$('[data-test-id="next"]').attr('disabled'), undefined, 'can click next btn because bot properties are defaulted');

      let interactor = openDatepicker(this.$('.t-scheduled-date'));
      const expectedDate = new Date(2016, 4, 28);
      interactor.selectDate(expectedDate);

      // step 3 and next btn will not have changed disabled property yet
      return waitFor().
        then(() => {
          assert.equal(this.$('[data-test-id="step1"]').attr('disabled'), undefined);
          assert.equal(this.$('[data-test-id="step2"]').attr('disabled'), undefined);
          assert.equal(this.$('[data-test-id="step3"]').attr('disabled'), undefined, 'step3 btn not disabled anymore');
          assert.equal(this.$('[data-test-id="next"]').attr('disabled'), undefined, 'next btn not disabled anymore');

          /* CHECK CLASSES ON STATUS TRACKER */
          assert.notOk(this.$('[data-test-id="item1"]').hasClass('timeline__item--active'), 'active class');
          assert.ok(this.$('[data-test-id="item1"]').hasClass('timeline__item--completed'), 'no completed class on initial render');
          assert.ok(this.$('[data-test-id="item2"]').hasClass('timeline__item--active'), 'active class still on step2');
          assert.notOk(this.$('[data-test-id="item2"]').hasClass('timeline__item--completed'), 'no completed class on step2 yet');
          assert.notOk(this.$('[data-test-id="item3"]').hasClass('timeline__item--active'), 'ensuring no active class');
          assert.notOk(this.$('[data-test-id="item3"]').hasClass('timeline__item--completed'), 'no completed class on step3 yet');

          this.$('[data-test-id="next"]').click();

          /* CHECK CLASSES ON STATUS TRACKER */
          assert.notOk(this.$('[data-test-id="item1"]').hasClass('timeline__item--active'), 'active class');
          assert.ok(this.$('[data-test-id="item1"]').hasClass('timeline__item--completed'), 'no completed class on initial render');
          assert.notOk(this.$('[data-test-id="item2"]').hasClass('timeline__item--active'), 'ensuring no active class');
          assert.ok(this.$('[data-test-id="item2"]').hasClass('timeline__item--completed'), 'completed class on step2 after clicking next');
          assert.ok(this.$('[data-test-id="item3"]').hasClass('timeline__item--active'), 'active class on step3');
          assert.notOk(this.$('[data-test-id="item3"]').hasClass('timeline__item--completed'), 'no completed class on step3 yet');

          /* STEP 3 */
          assert.equal(this.$('[data-test-id="step1"]').attr('disabled'), undefined, 'status tracker action will no-op if on same state');
          assert.equal(this.$('[data-test-id="step2"]').attr('disabled'), undefined);
          assert.equal(this.$('[data-test-id="step3"]').attr('disabled'), undefined);
          assert.equal(model.get('provider').get('id'), ProviderD.idOne);
          assert.equal(this.$('[data-test-id="next"]').length, 0, 'next btn not present');
          assert.equal(this.$('[data-test-id="wo-send-post"]').length, 1, 'dispatch work order button has appeared');
        });
    });
});

test('transitions to step-3 from step-1 when click step3 in status-tracker component', function(assert) {
  run(() => {
    store.push('work-order', { id: WD.idOne, scheduled_date: new Date(), approved_amount: WD.approvedAmount, 
      category_fk: CD.idOne, provider_fk: ProviderD.idOne });
    store.push('provider', { id: ProviderD.idOne, name: ProviderD.nameOne, workOrders: [WD.idOne] });
  });
  this.model = model;
  this.render(hbs`{{work-orders/new model=model}}`);

  /* OK to transition to step3 */
  assert.equal(this.$('[data-test-id="step1"]').attr('disabled'), undefined);
  assert.equal(this.$('[data-test-id="step2"]').attr('disabled'), undefined);
  assert.equal(this.$('[data-test-id="step3"]').attr('disabled'), undefined, 'can transition to step3 b/c have cat and provider');
  assert.equal(this.$('[data-test-id="next"]').attr('disabled'), undefined);
  assert.equal(this.$(`${PROVIDER_COMPONENT} ${PowerSelect}`).text().trim(), ProviderD.nameOne);

  this.$('[data-test-id="step3"]').click();

  /* STEP 3*/
  assert.equal(this.$('[data-test-id="step1"]').attr('disabled'), undefined, 'step1 is enabled');
  assert.equal(this.$('[data-test-id="step2"]').attr('disabled'), undefined, 'step2 is enabled');
  assert.equal(this.$('[data-test-id="step3"]').attr('disabled'), undefined, 'step3 is enabled bc wo has scheduled_date and approved_amount');
  assert.equal(this.$('[data-test-id="next"]').length, 0, 'next btn not present');

  assert.equal(model.get('category').get('id'), CD.idOne);
  assert.equal(model.get('provider').get('id'), ProviderD.idOne, 'model provider hasnt changed');
  assert.equal(model.get('approved_amount'), WD.approvedAmount);
  assert.equal(this.$('[data-test-id="wo-send-post"]').length, 1);

  this.$('[data-test-id="step1"]').click();

  /* STEP 1 */
  assert.equal(this.$('[data-test-id="step1"]').attr('disabled'), undefined, 'status tracker action will no-op if on same state');
  assert.equal(this.$('[data-test-id="step2"]').attr('disabled'), undefined);
  assert.equal(this.$('[data-test-id="step3"]').attr('disabled'), undefined);
  assert.equal(this.$('[data-test-id="item1"]').hasClass('timeline__item--active'), true);
  assert.equal(this.$('[data-test-id="item3"]').hasClass('timeline__item--completed'), false);
  assert.equal(this.$(`${PROVIDER_COMPONENT} ${PowerSelect}`).text().trim(), ProviderD.nameOne, 'model provider has not changed after navigate back to step-1');
  assert.equal(model.get('provider').get('id'), ProviderD.idOne);
  assert.equal(model.get('approved_amount'), WD.approvedAmount, 'model approved_amount has not changed');
});

test('step 4 will have all buttons disabled and no cancel button', function(assert) {
  run(() => {
    store.push('work-order', { id: WD.idOne, scheduled_date: new Date(), approved_amount: WD.approvedAmount, category_fk: CD.idOne, provider_fk: ProviderD.idOne });
    store.push('provider', { id: ProviderD.idOne, name: ProviderD.nameOne, workOrders: [WD.idOne] });
  });
  this.model = model;
  this.dispatchWorkOrder = function* () {
    yield;
  };
  this.render(hbs`{{work-orders/new model=model dispatchWorkOrder=dispatchWorkOrder}}`);
  this.$('[data-test-id="step3"]').click();
  this.$('[data-test-id="next"]').click();
  this.$('[data-test-id="wo-send-post"]').click();
  return waitFor().
    then(() => {
      assert.equal(this.$('[data-test-id="step1"]').attr('disabled'), 'disabled', 'step1 is disabled');
      assert.equal(this.$('[data-test-id="step2"]').attr('disabled'), 'disabled', 'step2 is disabled');
      assert.equal(this.$('[data-test-id="step3"]').attr('disabled'), 'disabled', 'step3 is disabled');
      assert.equal(this.$('[data-test-id="cancel"]').length, 0);
    });
});
