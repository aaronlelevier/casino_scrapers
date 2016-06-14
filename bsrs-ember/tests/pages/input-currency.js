import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';

let { visitable, text, clickable, count, fillable, value } = PageObject;


export default PageObject.create({
  currencyCodeDropdown: clickable('.t-currency-code-select  > .ember-basic-dropdown-trigger'),
  currencyCodeOptionOne: text('.ember-power-select-option:eq(1)'),
  currencyCodeOptionOneClick: clickable('.ember-power-select-option:eq(1)'),
  currencyCodeText: text('.t-currency-code'),

  currencySymbolText: text('.t-currency-symbol'),

  authAmountInheritedFromClick: clickable('.t-inherited-msg-auth_amount-link'),
  authAmountInheritedFromText: text('.t-inherited-msg-auth_amount'),
  authAmountLabel: text('.admin.person.label.auth_amount'),
  authAmountPlaceholder: () => Ember.$('.t-amount').get(0)['placeholder'],
  authAmountValue: value('.t-amount'),
  authAmountFillin: fillable('.t-amount'),
});
