'''
Created on Jun 22, 2015

@author: tkrier
'''
from django.db import models
from django.contrib.auth.models import Group
from django.utils.encoding import python_2_unicode_compatible
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from rest_framework.authtoken.models import Token

from location.models import LocationLevel


@python_2_unicode_compatible
class Role(models.Model):

    CONTRACTOR = 'contractor'
    LOCATION = 'location'
    ROLE_TYPE_CHOICES = (
        (CONTRACTOR, 'admin.role.contractor'),
        (LOCATION, 'admin.role.location'),
    )

    group = models.OneToOneField(Group)
    location_level = models.ForeignKey(LocationLevel, null=True, blank=True)
    role_type = models.CharField(max_length=29,
                                choices=ROLE_TYPE_CHOICES,
                                default=LOCATION)

    class Meta:
        db_table = 'role_role'
        ordering = ('group__name',)

    def __str__(self):
        return self.group.name


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    '''
    Auto generates a Token every time a User is created to be used with TokenAuth.
    '''
    if created:
        Token.objects.create(user=instance)

        
