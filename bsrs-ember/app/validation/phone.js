let START = '^';
let END = '$';
let WS = '\\s*';
let SEP = '[.\\- /]*';
let OPTIONAL_COUNTRY_CODE = '((?:\\+|00)?[1-9]\\d*)?';
let AREA_CODE = '(\\(\\d{3}\\)|\\d{3})';
let PREFIX = '(\\d{3})';
let LINE_NUMBER = '(\\d{4})';
let PHONE_REGEX = new RegExp(START + WS + OPTIONAL_COUNTRY_CODE + SEP + AREA_CODE + SEP + PREFIX + SEP + LINE_NUMBER + WS + END);

var stripNonNumeric = function (str) {
    return str.replace(/[^0-9]+/, '');
};

var phoneIsAllowedRegion = function(phone) {
    var match = PHONE_REGEX.exec(phone);

    if (!match) {
        return true; // Can't determine region; format validation will have to take care of this
    }

    var countryCode = match[1];
    countryCode = countryCode ? parseInt(countryCode) : 1;

    if (countryCode !== 1) {
        return false;
    }

    var areaCode = parseInt(stripNonNumeric(match[2]));
    if (!areaCode || areaCode.toString().length !== 3) {
        return false;
    }

    return true;
};

var phoneIsValidFormat = function(phone) {
    var match = PHONE_REGEX.exec(phone);

    if (!match) {
        return false;
    }

    return true;
};

export { phoneIsAllowedRegion, phoneIsValidFormat };
