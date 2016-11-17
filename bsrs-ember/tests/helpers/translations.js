import Ember from 'ember';

export default function (service, json) {
  Object.keys(json).forEach(function(locale) {
    service.addTranslations(locale, json[locale]);
  });
}

export function getLabelText(input) {
  return Ember.$('label[for="'+ input +'"]').text().trim();
}
