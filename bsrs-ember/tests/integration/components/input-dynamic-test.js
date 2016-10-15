import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import PHONE_NUMBER_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number';

moduleForComponent('input-dynamic', 'integration: input-dynamic test', {
    integration: true
});

test('renders input with computed value property', function(assert) {
    var obj = PhoneNumber.create({
      number: null
    });
    var prop = 'number';
    this.set('obj', obj);
    this.set('prop', prop);
    this.render(hbs`{{input-dynamic prop=prop obj=obj}}`);
    assert.equal(this.$('.t-new-entry').val(), '');
    this.$('.t-new-entry').val(PHONE_NUMBER_DEFAULTS.numberOne);
    assert.equal(this.$('.t-new-entry').val(), PHONE_NUMBER_DEFAULTS.numberOne);
});
