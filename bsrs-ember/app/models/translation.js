import Ember from 'ember';
const { computed } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import NewMixin from 'bsrs-ember/mixins/model/new';
import inject from 'bsrs-ember/utilities/store';

const { run } = Ember;

var TranslationModel = Model.extend(NewMixin, {
  simpleStore: Ember.inject.service(),
  key: computed.alias('id'),
  locales: computed(function() {
    const trans_key = this.get('key');
    const filter = function(locale_trans) {
      const key = locale_trans.get('translation_key');
      return key === trans_key;
    };
    return this.get('simpleStore').find('locale-translation', filter);
  }),
  locale_ids: computed('locales.[]', function() {
    return this.get('locales').mapBy('id');
  }),
  localeIsDirty: computed('locales.[]', function() {
    let locales = this.get('locales');
    let bool = false;
    locales.forEach((locale) => {
      bool = locale.get('isDirty') || bool;
    });
    return bool;
  }),
  isDirtyOrRelatedDirty: computed('localeIsDirty', function() {
    // when this has an attr itself update the line below... this.get('isDirty') || this.get('localeIsDirty')
    return this.get('localeIsDirty');
  }).readOnly(),
  isNotDirtyOrRelatedNotDirty: computed.not('isDirtyOrRelatedDirty'),
  saveRelated() {
    this.saveLocales();
  },
  saveLocales() {
    let locales = this.get('locales');
    locales.forEach((locale) => {
      locale.save();
    });
  },
  rollbackLocales() {
    let store = this.get('simpleStore');
    let locales_to_remove = [];
    let locales = this.get('locales');
    locales.forEach((x) => {
      //remove
      if (x.get('isNotDirty')) {
        locales_to_remove.push(x.get('id'));
      }
      x.rollback();
    });
    run(function() {
      locales_to_remove.forEach((id) => {
        store.remove('locale-translation', id); //no code in the unit tests hit this currently
      });
    });
  },
  serialize() {
    var locales = [];
    this.get('locales').forEach(function(locale) {
      locales.push(locale.serialize());
    });
    return {
      id: this.get('id'),
      key: this.get('key'),
      locales: locales
    };
  },
  removeRecord() {
    run(() => {
      this.get('simpleStore').remove('translation', this.get('id'));
    });
  },
});

export default TranslationModel;
