import windowProxy from 'bsrs-ember/utilities/window-proxy';

var errorFunction = (xhr, textStatus, errorThrown, message) => {
    if (xhr.status === 403) {
        windowProxy.changeLocation('/login');
    }
};

export default errorFunction;
