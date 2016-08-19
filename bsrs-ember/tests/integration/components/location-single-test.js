import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import LF from "bsrs-ember/vendor/location_fixtures";
import LLF from "bsrs-ember/vendor/location-level_fixtures";
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LD from 'bsrs-ember/vendor/defaults/location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import waitFor from 'ember-test-helpers/wait';
import { clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';

var store, phone_number_types, default_phone_number_type, address_types, default_address_type, default_email_type, email_types, run = Ember.run;

moduleForComponent('locations/location-detail', 'integration: locations/location-detail test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:location', 'model:phonenumber', 'model:phone-number-type', 'model:address-type', 'model:address', 'model:email', 'model:email-type']);
        translation.initialize(this);
        var service = this.container.lookup('service:i18n');
        var json = translations.generate('en');
        loadTranslations(service, json);
        let pn_types = [{ 'id': '2bff27c7-ca0c-463a-8e3b-6787dffbe7de', 'name': 'admin.phonenumbertype.office' },
        { 'id': '9416c657-6f96-434d-aaa6-0c867aff3270', 'name': 'admin.phonenumbertype.mobile' }];
        run(() => {
            pn_types.forEach(function(pnt) {
                store.push('phone-number-type', pnt);
            });
        });
        phone_number_types = store.find('phone-number-type');
        default_phone_number_type = phone_number_types.objectAt(0);
        let ad_types = [{ "id": "8e16a68c-fda6-4c30-ba7d-fee98257e92d", "name": "admin.address_type.office" },
            { "id": "f7e55e71-1ff2-4cc2-8700-139802738bd0", "name": "admin.address_type.shipping" }];
        run(() => {
            ad_types.forEach(function(ad) {
                store.push('address-type', ad);
            });
        });
        address_types = store.find('phone-number-type');
        default_address_type = address_types.objectAt(0);
        let em_types = [{ 'id': ETD.personalId, 'name': ETD.personalEmail },
        { 'id': ETD.workId, 'name': ETD.workEmail }];
        run(() => {
            em_types.forEach(function(emt) {
                store.push('email-type', emt);
            });
        });
        email_types = store.find('email-type');
        default_email_type = email_types.objectAt(0);
    }
});

test('filling in invalid name reveal validation messages', function(assert) {
    run(() => {
        this.model = store.push('location', {id: LD.idOne, name: LD.storeName});
    });
    this.phone_number_types = phone_number_types;
    this.default_phone_number_type = default_phone_number_type;
    this.render(hbs`{{locations/location-detail model=model phone_number_types=phone_number_types default_phone_number_type=default_phone_number_type}}`);
    var $component = this.$('.t-input-multi-phone-validation-format-error');
    assert.equal($component.length, 0);
    this.$('.t-location-name').val('').trigger('change');
    var save_btn = this.$('.t-save-btn');
    save_btn.trigger('click').trigger('change');
    $component = this.$('.t-name-validation-error');
    assert.equal($component.length, 1);
});

test('filling in location level on location new template will set diabled to false for children and parents', function(assert) {
    run(() => {
        this.model = store.push('location', {id: UUID.value, new: true});
        store.push('location-level', LLF.generate(LLD.idOne));
        store.push('location-level', LLF.generate(LLD.idTwo, LLD.nameDistrict));
    });
    this.all_location_levels = store.find('location-level');
    this.render(hbs`{{locations/location-detail model=model all_location_levels=all_location_levels}}`);
    assert.equal(this.$('.t-location-children-select .ember-basic-dropdown-trigger input').attr('disabled'), 'disabled');
    assert.equal(this.$('.t-location-parent-select .ember-basic-dropdown-trigger input').attr('disabled'), 'disabled');
    clickTrigger('.t-location-level-select');
    nativeMouseUp(`.ember-power-select-option:contains(${LLD.nameDistrict})`);
    assert.equal(this.$('.t-location-children-select-trigger > input').attr('disabled'), undefined);
    assert.equal(this.$('.t-location-parent-select-trigger > input').attr('disabled'), undefined);
});

test('filling in invalid phone number reveal validation messages', function(assert) {
    run(() => {
        this.model = store.push('location', {});
    });
    this.phone_number_types = phone_number_types;
    this.default_phone_number_type = default_phone_number_type;
    this.render(hbs`{{locations/location-detail model=model phone_number_types=phone_number_types default_phone_number_type=default_phone_number_type}}`);
    var $component = this.$('.t-input-multi-phone-validation-format-error');
    assert.equal($component.length, 0);
    this.$('.t-btn-add:eq(0)').click();
    $component = this.$('.t-input-multi-phone-validation-format-error');
    assert.ok($component.is(':hidden'));
    assert.equal($component.length, 1);
    this.$('.t-new-entry').val('a').trigger('change');
    $component = this.$('.t-input-multi-phone-validation-format-error');
    assert.ok($component.is(':visible'));
    assert.equal($component.length, 1);
    this.$('.t-new-entry').val('515-222-3333').trigger('change');
    $component = this.$('.t-input-multi-phone-validation-format-error');
    assert.ok($component.is(':hidden'));
});

test('if save isRunning, btn is disabled', function(assert) {
  run(() => {
    this.model = store.push('location', {id: LD.idOne});
  });
  // monkey patched.  Not actually passed to component but save.isRunning comes from save ember-concurrency task
  this.saveIsRunning = { isRunning: 'disabled' };
  this.render(hbs`{{locations/location-detail model=model saveTask=saveIsRunning}}`);
  assert.equal(this.$('.t-save-btn').attr('disabled'), 'disabled', 'Button is disabled if xhr save is outstanding');
});

test('filling in invalid address reveals validation messages', function(assert) {
    run(() => {
        this.model = store.push('location', {});
    });
    this.address_types = address_types;
    this.default_address_type = default_address_type;
    this.render(hbs`{{locations/location-detail model=model address_types=address_types default_address_type=default_address_type}}`);
    //street
    var $component = this.$('.t-input-multi-address-validation-error');
    assert.equal($component.length, 0);
    this.$('.t-add-address-btn:eq(0)').click();
    $component = this.$('.t-input-multi-address-validation-error');
    assert.ok($component.is(':hidden'));
    assert.equal($component.length, 1);
    this.$('.t-address-address').val('a').trigger('change');
    $component = this.$('.t-input-multi-address-validation-error');
    assert.ok($component.is(':visible'));
    assert.equal($component.length, 1);
    this.$('.t-address-address').val('925 Sky Park').trigger('change');
    $component = this.$('.t-input-multi-address-validation-error');
    assert.ok($component.is(':hidden'));
    //zip
    $component = this.$('.t-input-multi-address-zip-validation-error');
    assert.ok($component.is(':hidden'));
    assert.equal($component.length, 1);
    this.$('.t-address-postal-code').val('a').trigger('change');
    $component = this.$('.t-input-multi-address-zip-validation-error');
    assert.ok($component.is(':visible'));
    assert.equal($component.length, 1);
    this.$('.t-address-postal-code').val('97255').trigger('change');
    $component = this.$('.t-input-multi-address-zip-validation-error');
    assert.ok($component.is(':hidden'));
    assert.equal($component.length, 1);
});

test('filling in invalid emails reveal validation messages', function(assert) {
    run(() => {
        this.model = store.push('location', {});
    });
    this.email_types = email_types;
    this.default_email_type = default_email_type;
    this.render(hbs`{{locations/location-detail model=model email_types=email_types default_email_type=default_email_type}}`);
    var $component = this.$('.t-input-multi-email-validation-format-error');
    assert.equal($component.length, 0);
    this.$('.t-add-email-btn:eq(0)').click();
    $component = this.$('.t-input-multi-email-validation-format-error');
    assert.ok($component.is(':hidden'));
    assert.equal($component.length, 1);
    this.$('.t-new-entry').val('a').trigger('change');
    $component = this.$('.t-input-multi-email-validation-format-error');
    assert.ok($component.is(':visible'));
    assert.equal($component.length, 1);
    this.$('.t-new-entry').val('snewcomer24@gmail.com').trigger('change');
    $component = this.$('.t-input-multi-email-validation-format-error');
    assert.ok($component.is(':hidden'));
});

test('can remove a new phone number', function(assert) {
    run(() => {
        this.model = store.push('location', {});
    });
    this.phone_number_types = phone_number_types;
    this.default_phone_number_type = default_phone_number_type;
    this.render(hbs`{{locations/location-detail model=model phone_number_types=phone_number_types default_phone_number_type=default_phone_number_type}}`);
    this.$('.t-btn-add:eq(0)').click();
    assert.equal(this.$('.t-new-entry').length, 1);
    this.$('.t-del-btn:eq(0)').click();
    assert.equal(this.$('.t-new-entry').length, 0);
});

test('can add and remove new email', function(assert) {
    run(() => {
        this.model = store.push('location', {});
    });
    this.email_types = email_types;
    this.default_email_type = default_email_type;
    this.render(hbs`{{locations/location-detail model=model email_types=email_types default_email_type=default_email_type}}`);
    this.$('.t-add-email-btn:eq(0)').click();
    assert.equal(this.$('.t-new-entry').length, 1);
    this.$('.t-del-email-btn:eq(0)').click();
    assert.equal(this.$('.t-new-entry').length, 0);
});

test('can add and remove new address', function(assert) {
    run(() => {
        this.model = store.push('location', {});
    });
    this.address_types = address_types;
    this.default_address_type = default_address_type;
    this.render(hbs`{{locations/location-detail model=model address_types=address_types default_address_type=default_address_type}}`);
    this.$('.t-add-address-btn:eq(0)').click();
    assert.equal(this.$('.t-address-address').length, 1);
    this.$('.t-del-address-btn:eq(0)').click();
    assert.equal(this.$('.t-address-address').length, 0);
});
