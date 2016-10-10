import Ember from 'ember';

var SaveFiltersetMixin = Ember.Mixin.create({
  actions: {
    invokeSaveFilterSet() {
      this.get('save_filterset')(this.get('filtersetName')).then(() => {
        this.toggleProperty('savingFilter');
        this.set('filtersetName', '');
        this.set('logMsg', '');
      }, (xhr) => {
        if (xhr.status === 400) {
          //TODO: put into translations
          this.set('logMsg', 'This saved filter name is already taken');
        }
      });
    },
  }
});

export default SaveFiltersetMixin;
