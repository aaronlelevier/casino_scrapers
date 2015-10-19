import PageObject from '../page-object';

let { visitable, fillable, clickable } = PageObject;

var CategoryPage = PageObject.build({
  visit: visitable('/'),
  nameFill: fillable('.t-category-name'),
  nameInput: PageObject.value('.t-category-name'),
  descriptionFill: fillable('.t-category-description'),
  descriptionInput: PageObject.value('.t-category-description'),
  amountFill: fillable('.t-amount'),
  amountInput: PageObject.value('.t-amount'),
  costCodeFill: fillable('.t-category-cost-code'),
  costCodeInput: PageObject.value('.t-category-cost-code'),
  labelFill: fillable('.t-category-label'),
  labelInput: PageObject.value('.t-category-label'),
  subLabelFill: fillable('.t-category-subcategory-label'),
  clickSelectizeOption: clickable('.t-category-children-select div.option:eq(0)'), 
});

export default CategoryPage;
