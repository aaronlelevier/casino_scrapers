export default function (service, json) {
  Object.keys(json).forEach(function(locale) {
    service.addTranslations(locale, json[locale]);
  });
}
