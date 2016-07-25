import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';

let { visitable, text, clickable, count, fillable, value } = PageObject;


export default PageObject.create({
  currencyCodeText: text('.t-currency-code-select'),
  currencyCodeSelectText: text('.t-currency-code-select'),

  currencySymbolText: text('.t-currency-symbol'),

  authAmountInheritedFromClick: clickable('.t-inherited-msg-auth_amount-link'),
  authAmountInheritedFromText: text('.t-inherited-msg-auth_amount'),
  authAmountPlaceholder: () => Ember.$('.t-amount').get(0)['placeholder'],
  authAmountValue: value('.t-amount'),
  authAmountFillin: fillable('.t-amount'),
});
