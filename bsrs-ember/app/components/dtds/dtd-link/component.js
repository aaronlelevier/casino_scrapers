import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/uuid';

var DtdLinkComponent = Ember.Component.extend({
  uuid: inject('uuid'),
  classNames: ['input-multi-dtd-link t-input-multi-dtd-link'],
  actions: {
    append(){
      const model = this.get('model');
      const links_length = model.get('links.length');
      const id = this.get('uuid').v4();
      const obj = {id: id, new: true, order: links_length};
      run(() => {
        model.add_link(obj);
      });
    },
    delete(link) {
      const links = this.get('model').get('links');
      run(() => {
        if (links.get('length') === 1) {
          const id = this.get('uuid').v4();
          const model = {id: id, new: true};
          this.get('model').add_link(model);
        }
        this.get('model').remove_link(link.get('id'));
      });

    }
  }
});

export default DtdLinkComponent;
