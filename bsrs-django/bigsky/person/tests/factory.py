import string
import random

from django.contrib.auth.models import User

from model_mommy import mommy

from person.models import Person


USER_DICT = {
    'password': 'torment',
    'first_name': 'Test',
    'last_name': 'User',
    'email': 'tuser@bigskytech.com'
    }

PASSWORD = '1234'


def create_single_person(username):
    USER_DICT['username'] = username
    user = mommy.make(Person, **USER_DICT)
    user.set_password(PASSWORD)
    user.save()
    return user


def create_person(username=None, _many=1):
    '''
    Create all ``Person`` objects using this function.  ( Not mommy.make(<object>) )

    Return: the last user created from the `forloop`
    '''
    if username and _many != 1:
        raise Exception("Can't specify more than 1 user with a specific username. \
You specified {} user(s) with username: {}".format(_many, username))
    elif username:
        return create_single_person(username)
        
    for i in range(_many):
        username = ''.join([random.choice(string.ascii_letters) for x in range(10)])
        USER_DICT['username'] = username
        user = mommy.make(Person, **USER_DICT)
        user.set_password(PASSWORD)
        user.save()
    
    return user
