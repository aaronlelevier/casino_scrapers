import Ember from 'ember';

export default Ember.Mixin.create({
  registerCB(response, cb) {
    response.results.forEach((result) => {
      Ember.run.later(cb, 0);
    });
  }
});


