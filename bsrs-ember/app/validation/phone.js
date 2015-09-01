var phone_number_validation = function(value) {
    var phone_pattern = /^\d{3}\d{3}\d{4}$/;
    var digits = value.replace(/\D/g, '');
    return (digits.match(phone_pattern) !== null);
};

export default phone_number_validation;
