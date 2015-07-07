'''
Created on Jan 30, 2014

@author: tkrier
'''
from django.db import models
from django.contrib.auth.models import User
from django.utils.encoding import python_2_unicode_compatible

from role.models import Role
from location.models import AbstractName


class PersonStatus(AbstractName):
    pass


@python_2_unicode_compatible
class Person(User):
    # keys
    status = models.ForeignKey(PersonStatus, null=True, blank=True)
    role = models.ForeignKey(Role, null=True, blank=True)
    # fields
    title = models.CharField(max_length=100, blank=True)
    emp_number = models.CharField(max_length=100, blank=True)
    auth_amount = models.DecimalField(max_digits=15, decimal_places=4, null=True)
    middle_initial = models.CharField(max_length=30, blank=True)
    accept_assign = models.BooleanField(default=False)

    class Meta:
        db_table = 'person_person'

    def __str__(self):
        return self.username
