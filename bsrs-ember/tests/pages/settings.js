import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';
let { value, visitable, fillable, clickable, hasClass, count, text } = PageObject;

var SettingsPage = PageObject.create({
    test_modeClick: clickable('.t-dtd-test_mode-label')
});

export default SettingsPage;
