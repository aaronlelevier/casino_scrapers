'''
Created on Jan 30, 2014

@author: tkrier
'''
from django.db import models
from django.conf import settings
from django.contrib.auth.models import User, Group
from django.utils.encoding import python_2_unicode_compatible
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.contrib.contenttypes.fields import GenericRelation
from django.core.exceptions import ValidationError

from rest_framework.authtoken.models import Token

from location.models import LocationLevel, Location
from util import choices
from util.models import AbstractName, MainSetting, CustomSetting


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
    main_settings = GenericRelation(MainSetting)
    custom_settings = GenericRelation(CustomSetting)

    class Meta:
        db_table = 'role_role'
        ordering = ('group__name',)
        permissions = (
            ('view_role', 'can view role'),
        )

    def __str__(self):
        return self.group.name

    @property 
    def _name(self):
        return self.__name__.lower()

'''

from django.contrib.auth.models import User, Group, Permission, ContentType
ct = ContentType.objects.get(app_label='person', model='role')
perms = Permission.objects.filter(content_type=ct)
for p in perms:
    print p

'''


class PersonStatus(AbstractName):
    pass


@python_2_unicode_compatible
class Person(User):
    '''
    Addit. required fields: `first_name` and `last_name` will be required 
    fields even though they aren't in the default Django User models, so 
    enforce this using as "pre_save @receiver signal"
    '''
    # Keys
    role = models.ForeignKey(Role)
    status = models.ForeignKey(PersonStatus)
    location = models.ManyToManyField(Location)
    # required
    authorized_amount = models.PositiveIntegerField()
    authorized_amount_currency = models.CharField(max_length=25, choices=choices.CURRENCY_CHOICES)
    accept_assign = models.BooleanField(default=True)
    accept_notify = models.BooleanField(default=True)
    # optional
    employee_id = models.CharField(max_length=100, blank=True, null=True)
    middle_initial = models.CharField(max_length=30, blank=True, null=True)
    title = models.CharField(max_length=100, blank=True, null=True)
    
    # use as a normal Django Manager() to access related setting objects.
    main_settings = GenericRelation(MainSetting)
    custom_settings = GenericRelation(CustomSetting)

    class Meta:
        db_table = 'person_person'

    def __str__(self):
        return self.username


# @receiver(pre_save, sender=settings.AUTH_USER_MODEL)
# def user_pre_save(sender, instance=None, created=False, **kwargs):
#     if not instance.first_name or instance.last_name:
#         raise ValidationError("Person first and last name is required.")


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    '''
    Auto generates a Token every time a User is created to be used with TokenAuth.
    '''
    if created:
        Token.objects.create(user=instance)