import Ember from 'ember';

    
function typeText(selector, text) {
    $(selector).val(text);
    $(selector).trigger('input');
}

export default function typeInSearch(text) {
    $('.ember-power-select-trigger').click();
    Ember.run.later(() => {
        typeText('.ember-power-select-search input, .ember-power-select-trigger-multiple-input', text);
    });
}

