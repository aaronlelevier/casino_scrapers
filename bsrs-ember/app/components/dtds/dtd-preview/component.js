import Ember from 'ember';

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  noteClass: Ember.computed(function() {
    const note_type = this.get('model.note_type');
    const translated = this.get('i18n').t(note_type);
    const className = translated.string ? translated.string.toLowerCase() : 'info';
    return `alert-${className}`;
  }),
});
