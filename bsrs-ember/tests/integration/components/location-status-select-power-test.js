import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LD from 'bsrs-ember/vendor/defaults/location';
import LDS from 'bsrs-ember/vendor/defaults/location-status';

let store, location_one, status_one, status_two, status_three, trans, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger';
const COMPONENT = '.t-power-select-foreign-key-status';
const DROPDOWN = '.ember-power-select-dropdown';

moduleForComponent('location-status-select', 'integration: location-status-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:location', 'model:location-status']);
        run(function() {
            location_one = store.push('location', {id: LD.idOne, status_fk: LDS.openId});
            status_one = store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: [LD.idOne]});
            status_two = store.push('location-status', {id: LDS.closedId, name: LDS.closedName});
            status_three = store.push('location-status', {id: LDS.futureId, name: LDS.futureName});
        });
        trans = this.container.lookup('service:i18n');
        translation.initialize(this);
    }
});

test('should render a selectbox with bound options (defaulted to open on new template)', function(assert) {
    let all_statuses = store.find('location-status');
    status_one.set('locations', [LD.idOne]);
    this.set('model', location_one);
    this.set('all_statuses', all_statuses);
    this.render(hbs`{{power-select-foreign-key mainModel=model selected=model.status change_method='change_status' relatedModels=all_statuses relatedModelName='status' i18n=true}}`);
    let $component = this.$(`${COMPONENT}`);
    assert.equal($component.find(`${PowerSelect}`).text().trim(), trans.t(LDS.openName));
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    assert.equal(location_one.get('status').get('id'), LDS.openId);
    assert.deepEqual(status_one.get('locations'), [LD.idOne]);
});

test('should be able to select same status when location already has a status', function(assert) {
    let all_statuses = store.find('location-status');
    status_one.set('locations', [LD.idOne]);
    this.set('model', location_one);
    this.set('all_statuses', all_statuses);
    this.render(hbs`{{power-select-foreign-key mainModel=model selected=model.status change_method='change_status' relatedModels=all_statuses relatedModelName='status' i18n=true}}`);
    let $component = this.$(`${COMPONENT}`);
    assert.equal($component.find(`${PowerSelect}`).text().trim(), trans.t(LDS.openName));
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    run(() => {
        $(`.ember-power-select-option:contains(${LDS.openName})`).mouseup();
    });
    assert.equal($(`${DROPDOWN}`).length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(`${PowerSelect}`).text().trim(), trans.t(LDS.openName));
    assert.equal(location_one.get('status').get('id'), LDS.openId);
    assert.deepEqual(status_one.get('locations'), [LD.idOne]);
});

test('should be able to select new status when location already has a status', function(assert) {
    let all_statuses = store.find('location-status');
    status_one.set('locations', [LD.idOne]);
    this.set('model', location_one);
    this.set('all_statuses', all_statuses);
    this.render(hbs`{{power-select-foreign-key mainModel=model selected=model.status change_method='change_status' relatedModels=all_statuses relatedModelName='status' i18n=true}}`);
    let $component = this.$(`${COMPONENT}`);
    assert.equal($component.find(`${PowerSelect}`).text().trim(), trans.t(LDS.openName));
    clickTrigger();
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    run(() => {
        $(`.ember-power-select-option:contains(${LDS.closedName})`).mouseup();
    });
    assert.equal($(`${DROPDOWN}`).length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(`${PowerSelect}`).text().trim(), trans.t(LDS.closedName));
    assert.equal(location_one.get('status').get('id'), LDS.closedId);
    assert.deepEqual(status_one.get('locations'), []);
    assert.deepEqual(status_two.get('locations'), [LD.idOne]);
});
