import Ember from 'ember';

export default Ember.Helper.helper((params) => {
  if(params[2]){
    return params[0] === params[1] || params[0] === params[2];
  }
  return params[0] === params[1];
});
