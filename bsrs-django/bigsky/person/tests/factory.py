import string
import random

from django.contrib.auth.models import User

from model_mommy import mommy

from accounting.models import Currency, AuthAmount
from location.models import Location
from person.models import Person, PersonStatus, Role
from util import create


PASSWORD = '1234'


def create_role():
    currency = Currency.objects.default()
    auth_amount = mommy.make(AuthAmount, currency=currency)
    return mommy.make(Role, default_auth_amount=auth_amount, name=create._generate_chars())


def create_single_person(username, role):
    return Person.objects.create_user(username, 'myemail@mail.com', PASSWORD, role=role)


def create_person(username=None, _many=1):
    '''
    Create all ``Person`` objects using this function.  ( Not mommy.make(<object>) )

    Return: the last user created from the `forloop`
    '''
    role = create_role()

    # Single User Create
    if username and _many != 1:
        raise Exception("Can't specify more than 1 user with a specific username. \
You specified {} user(s) with username: {}".format(_many, username))
    elif username:
        return create_single_person(username, role)
        
    # Multiple User Create
    for i in range(_many):
        username = ''.join([random.choice(string.ascii_letters) for x in range(10)])
        user = create_single_person(username, role)
    
    return user
