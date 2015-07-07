from django.contrib.auth.models import User

from model_mommy import mommy

from person.models import Person


USER_DICT = {
    'username': 'testuser',
    'password': 'torment',
    'first_name': 'Test',
    'last_name': 'User',
    'email': 'tuser@bigskytech.com'
    }

PASSWORD = '1234'


def create_person(username=None):
    if username:
        USER_DICT['username'] = username
    user = mommy.make(Person, **USER_DICT)
    user.set_password(PASSWORD)
    user.save()
    return user
