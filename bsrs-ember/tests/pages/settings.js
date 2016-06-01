import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';
let { value, visitable, fillable, clickable, hasClass, count, text } = PageObject;
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';


const DROPDOWN = options;
const START_DTD_SELECT = '.t-settings-dt_start-select > .ember-basic-dropdown-trigger';

var SettingsPage = PageObject.create({
    modulesTicketsClick: clickable('.t-settings-modules-tickets-label'),
    modulesWorkordersClick: clickable('.t-settings-modules-work_orders-label'),
    modulesInvoicesClick: clickable('.t-settings-modules-invoices-label'),
    testmodeClick: clickable('.t-settings-test_mode-label'),

    startDtdInput: text(START_DTD_SELECT),
    startDtdClickDropdown: clickable(START_DTD_SELECT),
    startDtdClickOne: clickable('.ember-power-select-option:eq(1)', { scope: DROPDOWN }),
    startDtdTextOne: text('.ember-power-select-option:eq(1)')
});

export default SettingsPage;
