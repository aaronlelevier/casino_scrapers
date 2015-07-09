'''
Created on Jan 30, 2014

@author: tkrier
'''
from django.db import models
from django.conf import settings
from django.contrib.auth.models import User, Group
from django.utils.encoding import python_2_unicode_compatible
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.fields import GenericRelation

from rest_framework.authtoken.models import Token

from location.models import AbstractName, LocationLevel
from util.models import Setting


@python_2_unicode_compatible
class Role(models.Model):

    CONTRACTOR = 'contractor'
    LOCATION = 'location'
    ROLE_TYPE_CHOICES = (
        (CONTRACTOR, CONTRACTOR),
        (LOCATION, LOCATION),
    )
    # keys
    group = models.OneToOneField(Group)
    location_level = models.ForeignKey(LocationLevel, null=True, blank=True)
    role_type = models.CharField(max_length=29,
                                choices=ROLE_TYPE_CHOICES,
                                default=LOCATION)

    # use as a normal Django Manager() to access related setting objects.
    settings = GenericRelation(Setting)

    class Meta:
        db_table = 'role_role'
        ordering = ('group__name',)

    def __str__(self):
        return self.group.name


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
    
    # use as a normal Django Manager() to access related setting objects.
    settings = GenericRelation(Setting)

    class Meta:
        db_table = 'person_person'

    def __str__(self):
        return self.username


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    '''
    Auto generates a Token every time a User is created to be used with TokenAuth.
    '''
    if created:
        Token.objects.create(user=instance)