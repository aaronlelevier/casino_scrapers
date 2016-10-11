import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/uuid';

var DtdLinkComponent = Ember.Component.extend({
  uuid: inject('uuid'),
  tagName: '',
  actions: {
    append(){
      const model = this.get('model');
      const options_length = model.get('options.length');
      const id = this.get('uuid').v4();
      const obj = {id: id, new: true, order: options_length};
      run(() => {
        this.get('model').add_option(obj);
      });
    },
    delete(option) {
      run(() => {
        this.get('model').remove_option(option.get('id'));
      });
    }
  }
});

export default DtdLinkComponent;
