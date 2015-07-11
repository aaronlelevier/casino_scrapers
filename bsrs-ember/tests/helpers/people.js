//To be replaced by vendor/people_fixtures
var phone_numbers = [
{
    "id":3,
    "number":"858-715-5026",
    "type":{
        "id":1,
        "name":"admin.phonenumbertype.office"
    }
},
{
    "id":4,
    "number":"858-715-5056",
    "type":{
        "id":2,
        "name":"admin.phonenumbertype.mobile"
    }
}];

var generatePerson = function() {
    return {
        "id": 11,
        "username": "lcooley",
        "first_name": "Lynne",
        "last_name": "Cooley",
        "title": "RVP",
        "emp_number": "5063",
        "auth_amount": "50000.0000"
    };
};

var PeopleFactory = {
    list: function() {
        var response = generatePerson();
        response.role = 10;
        response.role_name = 'user.role.regional_manager';
        response.phone_numbers = phone_numbers;
        return {results: [response]}; //TODO: updated the mocks in server/mocks
    },
    detail: function() {
        return generatePerson();
    },
    put: function(username, first_name, last_name, title, emp_number, auth_amount) {
        var response = generatePerson();
        response.title = title;
        response.username = username;
        response.first_name = first_name;
        response.last_name = last_name;
        response.title = title;
        response.emp_number = emp_number;
        response.auth_amount = auth_amount;
        return response;
    }
};

export default PeopleFactory;
