'''
Big Sky Retail Systems Framework
Location models

Created on Jan 21, 2015

@author: tkrier

'''
from django.db import models
from django.utils.encoding import python_2_unicode_compatible

from util.models import AbstractName


class LocationLevel(AbstractName):
    '''
    Use symmetrical = false to indicate one way relationship

    :docs: https://docs.djangoproject.com/en/1.8/ref/models/fields/#django.db.models.ManyToManyField.symmetrical
    '''
    children = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='parents')


class LocationStatus(AbstractName):
    pass

    
class LocationType(AbstractName):
    pass
    

@python_2_unicode_compatible
class Location(models.Model):
    # keys
    level = models.ForeignKey(LocationLevel, related_name='locations')
    status = models.ForeignKey(LocationStatus, related_name='locations')
    type = models.ForeignKey(LocationType, related_name='locations')
    people = models.ManyToManyField("person.Person", related_name='locations')
    relations = models.ManyToManyField('self')
    # fields
    name = models.CharField(max_length=100)
    number = models.CharField(max_length=20)

    class Meta:
        ordering = ('number',)
    
    def __str__(self):
        return self.name
