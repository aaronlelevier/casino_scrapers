var generatePerson = function() {
    return {
        "id": 11,
        "username": "lcooley",
        "first_name": "Lynne",
        "last_name": "Cooley",
        "title": "RVP",
        "empnumber": "5063",
        "authamount": "50000.0000"
    };
};

var PeopleFactory = {
    list: function() {
        var response = generatePerson();
        response.role = 10;
        response.role_name = 'user.role.regional_manager';
        return {results: [response]}; //TODO: updated the mocks in server/mocks
    },
    detail: function() {
        return generatePerson();
    },
    put: function(title) {
        var response = generatePerson();
        if(title) {
            response.title = title;
        }
        return response;
    }
};

export default PeopleFactory;
