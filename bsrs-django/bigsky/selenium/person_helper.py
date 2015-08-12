class PersonHelper(object):
    '''
    Loops through kwargs passed in as kwargs
    Ensure model has attrs (k) equal to id on template 
    '''
    def _fill_in(self, model):
    def __init__(self, **kwargs):
        for k, v in kwargs.iteritems():
            setattr(self, k, v)

        

