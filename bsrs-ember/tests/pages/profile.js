import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';
import PD from 'bsrs-ember/vendor/defaults/profile';

let { value, visitable, fillable, clickable, hasClass, count, text } = PageObject;

export default PageObject.create({
  descValue: value('.t-ap-description'),
  descFill: fillable('.t-ap-description'),
});
