'''
Created on Jan 30, 2014

@author: tkrier
'''
from django.db import models
from django.contrib.auth.models import User

from role.models import Role
from location.models import AbstractName


class PersonStatus(AbstractName):
    pass


class Person(User):
    '''
    Subclassing based on this Quora answer:

    http://www.quora.com/Could-someone-help-me-understand-the-Django-user-model-in-more-detail-and-ways-to-extend-it
    '''
    # keys
    status = models.ForeignKey(PersonStatus, null=True)
    role = models.ForeignKey(Role, null=True)
    # fields
    title = models.CharField(max_length=100, blank=True)
    empnumber = models.CharField(max_length=100, blank=True)
    authamount = models.DecimalField(max_digits=15, decimal_places=4, null=True)
    middleinitial = models.CharField(max_length=30, blank=True)
    acceptassign = models.BooleanField(default=False)

    class Meta:
        db_table = 'person_person'

    def __unicode__(self):
        return self.username
