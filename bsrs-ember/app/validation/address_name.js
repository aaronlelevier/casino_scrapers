var addressNameValidation = function(value) {
    let address_pattern = /^[0-9a-z.,@*&#\-\{\}\[\]\(\)\s]+$/i;
    if (!value || value.length < 3) {
        return false;
    }
    return (value.match(address_pattern) !== null);
};

export default addressNameValidation;

