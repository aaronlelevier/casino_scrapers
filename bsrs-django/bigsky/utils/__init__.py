class ListObject(object):
    """
    Turns an iterable of another type into a list.
    """

    def __init__(self, x):
        self.x = x
    
    def __getitem__(self, item):
        return self.x[item]
    
    def __iter__(self):        
        return iter(self.x)
    
    def __len__(self):
        return len(self.x)
    
    def count(self):
        return len(self.x)


class classproperty(object):
    """
    When used to decorate a method in a class, that method will behave
    like as a class property.
    """
    def __init__(self, f):
        # f - the func that's being decorated
        self.f = f

    def __get__(self, obj, cls):
        # call the func on the class
        return self.f(cls)
