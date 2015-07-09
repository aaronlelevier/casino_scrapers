import Ember from 'ember';
import InputMultiComponent from 'bsrs-ember/components/input-multi/component';

export default InputMultiComponent.extend({
  classNames: ['input-multi t-input-multi-phone'],
  layoutName: 'components/input-multi',
  modelType: 'x-number',
  fieldNames: 'number'
}); 
