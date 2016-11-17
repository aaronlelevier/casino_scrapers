// @public
//
// Generate a 'missing template' message that will be used
// as a translation.
//
// To override this, define `util:i18n/missing-message` with
// the signature
//
// `Function(String, String, Object) -> String`.
export default function missingMessage(locale, key /*, data */) {
  // NOTE: comment out for time being b/c output being generated alongside
  // tests, and tests harder to debug.
  if(key && key.indexOf && key.indexOf('.') != -1 && !$.isNumeric(key)){
    Ember.Logger.warn(key);
  }
  return key;
}
