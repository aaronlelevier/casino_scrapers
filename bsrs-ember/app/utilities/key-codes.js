var keyCodeList = [
    {key: 'enter', code: 13, escaped: true},
    {key: 'escape', code: 27}
];

var KeyCodes = {
    keyPressed: function (event) {
        return keyCodeList.filter(function (keyCode) {
            return keyCode.code === event.keyCode;
        }).map(function (keyCode) {
            return keyCode.key;
        })[0];
    }
};

export default KeyCodes;
