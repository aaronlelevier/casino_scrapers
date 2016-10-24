var postal_code_validation = function(value) {
    let postal_code_pattern = /^[a-z0-9\-\s]+$/i;
    if (!value || value.length < 5) {
        return false;
    }
    return (value.match(postal_code_pattern) !== null);
};

export default postal_code_validation;

