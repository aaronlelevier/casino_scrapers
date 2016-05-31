import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';
let { value, visitable, fillable, clickable, hasClass, count, text } = PageObject;

var SettingsPage = PageObject.create({
    modulesTicketsClick: clickable('.t-settings-modules-tickets-label'),
    modulesWorkordersClick: clickable('.t-settings-modules-work_orders-label'),
    modulesInvoicesClick: clickable('.t-settings-modules-invoices-label'),
    testmodeClick: clickable('.t-settings-test_mode-label'),
});

export default SettingsPage;
