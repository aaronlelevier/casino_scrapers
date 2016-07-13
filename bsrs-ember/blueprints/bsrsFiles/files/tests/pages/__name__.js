import Ember from 'ember';
import { create, visitable, fillable, text, value } from 'ember-cli-page-object';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { <%= CapitalizeModule %>_URL } from 'bsrs-ember/utilities/urls';
import <%= camelizedModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';

const BASE_URL = BASEURLS.BASE_<%= CapitalizeModule %>_URL;
const LIST_URL = `${BASE_URL}/index`;
const DETAIL_URL = `${BASE_URL}/${<%= camelizedModuleName %>D.idOne}`;

const <%= secondPropertyCamel %> = '.t-<%= dasherizedModuleName %>-<%= secondProperty %>-select';

export default create({
  visit: visitable(LIST_URL),
  visitDetail: visitable(DETAIL_URL),
  <%= firstPropertyCamel %>Value: value('.t-<%= dasherizedModuleName %>-<%= firstProperty %>'),
  <%= firstPropertyCamel %>Fill: fillable('.t-<%= dasherizedModuleName %>-<%= firstProperty %>'),
  <%= firstPropertyCamel %>GridOne: text('.t-<%= dasherizedModuleName %>-<%= firstProperty %>:eq(0)'),

  <%= secondProperty %>Input: text(<%= secondPropertyCamel %>),
  <%= secondProperty %>SortText: text('.t-sort-<%= secondProperty %>-<%= secondModelDisplaySnake %>'),
  <%= secondProperty %>GridOne: text('.t-<%= dasherizedModuleName %>-<%= secondProperty %>-<%= secondModelDisplaySnake %>:eq(0)'),
});
