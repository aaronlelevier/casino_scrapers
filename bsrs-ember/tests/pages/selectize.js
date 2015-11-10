import PageObject from '../page-object';

let { visitable, fillable, clickable } = PageObject;

var Selectize = PageObject.create({
  visit: visitable('/'),
  input: fillable('.selectize-input:eq(0) input'),
  inputTwo: fillable('.selectize-input:eq(1) input'),
  remove: clickable('div.item > a.remove:eq(0)'),
  removeSecond: clickable('div.item > a.remove:eq(1)'),
});

export default Selectize;
