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
