var address_name_validation = function(value) {
    let address_pattern = /^[0-9a-z.,@*&#\-\{\}\[\]\(\)\s]+$/i;
    if (value.length < 5) {
        return false;
    }
    return (value.match(address_pattern) !== null);
};

export default address_name_validation;

