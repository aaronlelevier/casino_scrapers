'''
Created on Jun 22, 2015

@author: tkrier
'''
from django.db import models
from django.contrib.auth.models import Group
from location.models import LocationLevel


class Role(Group):

    CONTRACTOR = 'contractor'
    LOCATION = 'location'
    ROLE_TYPE_CHOICES = (
        (CONTRACTOR, 'admin.role.contractor'),
        (LOCATION, 'admin.role.location'),
    )

    location_level = models.ForeignKey(LocationLevel, null=True)
    role_type = models.CharField(max_length=29,
                                choices=ROLE_TYPE_CHOICES,
                                default=LOCATION)

    class Meta:
        db_table = 'role_role'
        ordering = ('group__name',)
        
