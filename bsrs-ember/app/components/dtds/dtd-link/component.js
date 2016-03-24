import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/uuid';

var DtdLinkComponent = Ember.Component.extend({
  uuid: inject('uuid'),
  classNames: ['input-multi-dtd-link t-input-multi-dtd-link'],
  actions: {
    append(){
      const id = this.get('uuid').v4();
      const model = {id: id, new: true};
      run(() => {
        this.get('model').add_link(model);
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
