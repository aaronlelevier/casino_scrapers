class InputHelper(object):
    '''
    Loops through kwargs passed in as kwargs
    Ensure model has attrs (k) equal to id on template 
    '''
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)


def get_text_excluding_children(driver, element):
    return driver.execute_script("""
    return jQuery(arguments[0]).contents().filter(function() {
        return this.nodeType == Node.TEXT_NODE;
    }).text();
    """, element)
