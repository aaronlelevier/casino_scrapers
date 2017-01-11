import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import WORK_ORDER_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order';
import moment from 'moment';

const WD = WORK_ORDER_DEFAULTS.defaults();

let model, trans;

moduleForComponent('work-orders/new/step-4', 'Integration | Component | work orders/new/step 4', {
  integration: true,
  setup() {
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    const store = module_registry(this.container, this.registry);
    run(() => {
      model = store.push('work-order', { id: WD.idOne, tracking_number: WD.trackingNumberOne });
    });
  }
});

test('it renders with tracking number and success text', function(assert) {
  this.model = model;
  this.render(hbs`{{work-orders/new/step-4 model=model}}`);
  assert.equal(this.$('[data-test-id="tracking_number"]').text().trim(), WD.trackingNumberOne);
  assert.equal(this.$('[data-test-id="work-order-create-success"]').text().trim(), trans.t('work_order.label.success'));
});
