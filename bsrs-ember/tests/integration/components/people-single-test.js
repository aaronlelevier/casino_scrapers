import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/person';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import RD from 'bsrs-ember/vendor/defaults/role';
import GLOBAL from 'bsrs-ember/vendor/defaults/global-message';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currencies';

var store, email_types, default_email_type, phone_number_types, default_phone_number_type, address_types, default_address_type, run = Ember.run;

moduleForComponent('person-single', 'scott integration: person-single test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:role', 'model:currency']);
        translation.initialize(this);
        var service = this.container.lookup('service:i18n');
        var json = translations.generate('en');
        loadTranslations(service, json);
        run(function() {
            store.push('currency', CURRENCY_DEFAULTS);
        });
        let pn_types = [{ 'id': '2bff27c7-ca0c-463a-8e3b-6787dffbe7de', 'name': 'admin.phonenumbertype.office' },
        { 'id': '9416c657-6f96-434d-aaa6-0c867aff3270', 'name': 'admin.phonenumbertype.mobile' }];
        run(function() {
            pn_types.forEach(function(pnt) {
                store.push('phone-number-type', pnt);
            });
        });
        phone_number_types = store.find('phone-number-type');
        default_phone_number_type = phone_number_types.objectAt(0);
        let ad_types = [{ "id": "8e16a68c-fda6-4c30-ba7d-fee98257e92d", "name": "admin.address_type.office" },
            { "id": "f7e55e71-1ff2-4cc2-8700-139802738bd0", "name": "admin.address_type.shipping" }];
        run(function() {
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

test('filling in invalid username reveal validation messages', function(assert) {
    run(() => {
        this.set('model', store.push('person', {}));
    });
    this.render(hbs`{{people/person-single model=model}}`);
    var $component = this.$('.t-username-validation-error');
    assert.ok($component.is(':hidden'));
    var save_btn = this.$('.t-save-btn');
    save_btn.trigger('click').trigger('change');
    assert.ok($component.is(':visible'));
    this.$('.t-person-username').val('a').trigger('change');
    assert.ok($component.is(':hidden'));
    assert.equal($component.text(), GLOBAL.invalid_username);
});

test('filling in valid one char middle initial will not reveal validation messages', function(assert) {
    run(() => {
        this.set('model', store.push('person', {}));
    });
    this.render(hbs`{{people/person-single model=model}}`);
    var $component = this.$('.t-middle-initial-validation-error');
    assert.ok($component.is(':hidden'));
    var save_btn = this.$('.t-save-btn');
    save_btn.trigger('click').trigger('change');
    assert.ok($component.is(':hidden'));
    this.$('.t-person-middle-initial').val('a').trigger('change');
    assert.ok($component.is(':hidden'));
});

test('filling in invalid one char middle initial will reveal validation messages', function(assert) {
    run(() => {
        this.set('model', store.push('person', {}));
    });
    this.render(hbs`{{people/person-single model=model}}`);
    var $component = this.$('.t-middle-initial-validation-error');
    assert.ok($component.is(':hidden'));
    var save_btn = this.$('.t-save-btn');
    save_btn.trigger('click').trigger('change');
    assert.ok($component.is(':hidden'));
    this.$('.t-person-middle-initial').val('ab').trigger('change');
    assert.ok($component.is(':visible'));
    assert.equal($component.text(), GLOBAL.invalid_middle_initial);
});

test('filling in invalid email reveal validation messages', function(assert) {
    run(() => {
        this.model = store.push('person', {});
    });
    this.email_types = email_types;
    this.default_email_type = default_email_type;
    this.render(hbs`{{people/person-single model=model email_types=email_types default_email_type=default_email_type}}`);
    var $component = this.$('.t-input-multi-email-validation-format-error');
    assert.equal($component.length, 0);
    this.$('.t-add-email-btn:eq(0)').click();
    $component = this.$('.t-input-multi-email-validation-format-error');
    assert.ok($component.is(':hidden'));
    assert.equal($component.length, 1);
    this.$('.t-new-entry').val('a').trigger('change');
    $component = this.$('.t-input-multi-email-validation-format-error');
    assert.ok($component.is(':visible'));
    assert.equal($component.text(), GLOBAL.invalid_email);
    assert.equal($component.length, 1);
    this.$('.t-new-entry').val('snewcomer@gmail.com').trigger('change');
    $component = this.$('.t-input-multi-email-validation-format-error');
    assert.ok($component.is(':hidden'));
});

test('filling in invalid phone number reveal validation messages', function(assert) {
    run(() => {
        this.model = store.push('person', {});
    });
    this.phone_number_types = phone_number_types;
    this.default_phone_number_type = default_phone_number_type;
    this.render(hbs`{{people/person-single model=model phone_number_types=phone_number_types default_phone_number_type=default_phone_number_type}}`);
    var $component = this.$('.t-input-multi-phone-validation-format-error');
    assert.equal($component.length, 0);
    this.$('.t-add-btn:eq(0)').click();
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
    assert.equal($component.text(), GLOBAL.invalid_ph);
});

test('filling in invalid address reveals validation messages', function(assert) {
    run(() => {
        this.model = store.push('person', {});
    });
    this.address_types = address_types;
    this.default_address_type = default_address_type;
    this.render(hbs`{{people/person-single model=model address_types=address_types default_address_type=default_address_type}}`);
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
    assert.equal($component.text(), GLOBAL.invalid_street);
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
    assert.equal($component.text(), GLOBAL.invalid_zip);
    assert.equal($component.length, 1);
    this.$('.t-address-postal-code').val('97255').trigger('change');
    $component = this.$('.t-input-multi-address-zip-validation-error');
    assert.ok($component.is(':hidden'));
    assert.equal($component.length, 1);
});

test('can remove a new phone number', function(assert) {
    run(() => {
        this.model = store.push('person', {});
    });
    this.phone_number_types = phone_number_types;
    this.default_phone_number_type = default_phone_number_type;
    this.render(hbs`{{people/person-single model=model phone_number_types=phone_number_types default_phone_number_type=default_phone_number_type}}`);
    this.$('.t-add-btn:eq(0)').click();
    assert.equal(this.$('.t-new-entry').length, 1);
    this.$('.t-del-btn:eq(0)').click();
    assert.equal(this.$('.t-new-entry').length, 0);
});

test('can add and remove new email', function(assert) {
    run(() => {
        this.model = store.push('person', {});
    });
    this.email_types = email_types;
    this.default_email_type = default_email_type;
    this.render(hbs`{{people/person-single model=model email_types=email_types default_email_type=default_email_type}}`);
    this.$('.t-add-email-btn:eq(0)').click();
    assert.equal(this.$('.t-new-entry').length, 1);
    this.$('.t-del-email-btn:eq(0)').click();
    assert.equal(this.$('.t-new-entry').length, 0);
});

test('can add and remove new address', function(assert) {
    run(() => {
        this.model = store.push('person', {});
    });
    this.address_types = address_types;
    this.default_address_type = default_address_type;
    this.render(hbs`{{people/person-single model=model address_types=address_types default_address_type=default_address_type}}`);
    this.$('.t-add-address-btn:eq(0)').click();
    assert.equal(this.$('.t-address-address').length, 1);
    this.$('.t-del-address-btn:eq(0)').click();
    assert.equal(this.$('.t-address-address').length, 0);
});
