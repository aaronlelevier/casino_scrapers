class PersonHelper(object):
    def __init__(self, **kwargs):
        for k, v in kwargs.iteritems():
            setattr(self, k, v)
    # @property
    # def person(self):
    #     return {"first_name": "scooter", "last_name": "McGavine"}

        

