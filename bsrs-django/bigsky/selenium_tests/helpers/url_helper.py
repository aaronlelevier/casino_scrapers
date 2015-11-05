class URLHelper(object):
    '''
    splice out url to api endpoints
    '''
    @staticmethod
    def find_url(url, target_url):
        url_str = str(url)
        return url_str[url_str.find(target_url):] 

