var filterset_regex = function(url) {
    let query = url.slice(url.indexOf('?'));
    let remove_page = query.replace(/([?|&]page=)[^\&]+/g, '');
    let remove_size = remove_page.replace(/([?|&]page_size=)[^\&]+/g, '');
    return '?' + remove_size.substring(1);
};

export default filterset_regex;
