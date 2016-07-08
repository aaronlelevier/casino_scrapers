from assignment.models import Profile
from person.tests.factory import create_single_person
from utils.create import random_lorem


def create_profile(description=None):
    kwargs = {'description': description or random_lorem(1)}
    try:
        return Profile.objects.get(**kwargs)
    except Profile.DoesNotExist:
        kwargs['assignee'] = create_single_person()
        return Profile.objects.create(**kwargs)

def create_profiles():
    for i in range(10):
        create_profile()
