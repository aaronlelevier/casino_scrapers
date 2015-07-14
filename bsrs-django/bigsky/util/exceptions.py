'''
Create custom Exceptions that accept parameters here:

https://docs.python.org/2/tutorial/errors.html
'''

class PersonOrLocationRequired(Exception):
    pass

class CantHavePersonAndLocation(Exception):
    pass