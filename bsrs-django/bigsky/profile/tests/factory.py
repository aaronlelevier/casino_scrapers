from profile.models import Assignment
from person.tests.factory import create_single_person
from utils.create import random_lorem


def create_assignment(description=None):
    kwargs = {'description': description or random_lorem(1)}
    try:
        return Assignment.objects.get(**kwargs)
    except Assignment.DoesNotExist:
        kwargs['assignee'] = create_single_person()
        return Assignment.objects.create(**kwargs)

def create_assignments():
    for i in range(10):
        create_assignment()
