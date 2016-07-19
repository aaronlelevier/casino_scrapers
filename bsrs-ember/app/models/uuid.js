import Ember from 'ember';
import random from 'bsrs-ember/models/random';

export default Ember.Object.extend({
  v4: function() {
    var x = random.uuid();
    console.log(x);
    return x;
  }
});
