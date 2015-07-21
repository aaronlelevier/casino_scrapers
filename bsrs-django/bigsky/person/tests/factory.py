import string
import random

from django.contrib.auth.models import User

from model_mommy import mommy

from location.models import Location
from person.models import Person, PersonStatus, Role


USER_DICT = {
    'password': 'torment',
    'first_name': 'Test',
    'last_name': 'User',
    'email': 'tuser@bigskytech.com'
    }

PASSWORD = '1234'


def create_single_person(role, status, location, USER_DICT):
    user = mommy.make(Person, role=role, status=status, location=location, **USER_DICT)
    user.set_password(PASSWORD)
    user.save()
    return user


def create_person(username=None, _many=1):
    '''
    Create all ``Person`` objects using this function.  ( Not mommy.make(<object>) )

    Return: the last user created from the `forloop`
    '''
    # Single Related Objects
    role = mommy.make(Role)
    status = mommy.make(PersonStatus)
    location = mommy.make(Location)

    # Single User Create
    if username and _many != 1:
        raise Exception("Can't specify more than 1 user with a specific username. \
You specified {} user(s) with username: {}".format(_many, username))
    elif username:
        USER_DICT['username'] = username
        return create_single_person(role, status, location, USER_DICT)
        
    # Multiple User Create
    for i in range(_many):
        username = ''.join([random.choice(string.ascii_letters) for x in range(10)])
        USER_DICT['username'] = username
        user = create_single_person(role, status, location, USER_DICT)
    
    return user
