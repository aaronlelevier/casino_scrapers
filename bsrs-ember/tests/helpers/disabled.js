import QUnit from 'qunit';

var isNotDisabledElement = function(selector) {
    var pagination = find('.t-pages');
    QUnit.assert.equal(pagination.find(selector).hasClass('disabled'), false);
    QUnit.assert.equal(pagination.find(selector).attr('disabled'), undefined);
    QUnit.assert.equal(pagination.find(selector).hasClass('disabled'), false);
};

var isDisabledElement = function(selector) {
    var pagination = find('.t-pages');
    QUnit.assert.equal(pagination.find(selector).hasClass('disabled'), true);
    QUnit.assert.equal(pagination.find(selector).attr('disabled'), 'disabled');
    QUnit.assert.equal(pagination.find(selector).hasClass('disabled'), true);
};

export {isDisabledElement, isNotDisabledElement};
