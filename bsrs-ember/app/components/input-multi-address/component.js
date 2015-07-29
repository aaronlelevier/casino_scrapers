import Ember from 'ember';
import Address from 'bsrs-ember/models/address';
import AddressDefaults from 'bsrs-ember/vendor/defaults/address-type';

export default Ember.Component.extend({
  tagName: 'div',
  model: null,
  classNames: ['input-multi-address t-input-multi-address'],
  actions: {
    append() {
      this.get('model').pushObject(Address.create({type: AddressDefaults.officeType}));
    },
    delete(entry) {
      this.get('model').removeObject(entry);
    },
    changeType(address, val) {
        Ember.run(() => {
            address.set("type", val);
        });
        //this.get('target').send('changeType', val); //?? when is this used?
    },
    changeState(state, val) {
        Ember.run(() => {
            var state_id = parseInt(val, 10);
            state.set("state", state_id);
        });
        //this.get('target').send('changeState', val); //?? when is this used?
    },
    changeCountry(country, val) {
        Ember.run(() => {
            country.set("country", val);
        });
        //this.get('target').send('changeState', val); //?? when is this used?
    }
  }//action
});
