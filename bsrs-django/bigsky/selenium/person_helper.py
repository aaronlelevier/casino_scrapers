class PersonHelper(object):
    '''
    Loops through kwargs passed in as kwargs
    Ensure model has attrs (k) equal to id on template 
    '''
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)