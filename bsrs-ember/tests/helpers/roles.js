var settings = [];

var generateRecord = function() {
    return {
        "id": 3,
        "name": "System Administrator"
    };
};

var RecordFactory = {
    list: function() {
        var response = generateRecord();
        return {results: [response]}; //TODO: updated the mocks in server/mocks
    },
    detail: function() {
        return generateRecord();
    },
    put: function(name) {
        var response = generateRecord();
        response.name = name;
        return response;
    }
};

export default RecordFactory;
