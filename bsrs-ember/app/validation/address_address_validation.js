var address_name_validation = function(value) {
    if (value.length < 3) {
        return false;
    }
    return true;
};

export default address_name_validation;

