'''
Big Sky Retail Systems Framework
Location models

Created on Jan 21, 2015

@author: tkrier

'''
from django.db import models
from django.utils.encoding import python_2_unicode_compatible

from util.models import AbstractName


class LocationLevelQuerySet(models.query.QuerySet):
    '''
    Returns a set() of all Child IDs for a single Parent ``LocationLevel``
    '''

    def get_all_children(self, parent, all_children=None):
        # init an empty all_children if not present
        if not all_children:
            all_children = set()

        new_children = set(parent.children.values_list('id', flat=True))

        while new_children:
            all_children.update(new_children)
            # for each child, call the function in a tree
            for ea in new_children:
                ea = LocationLevel.objects.get(id=ea)
                self.get_all_children(ea, all_children)
        
        return all_children

'''
from location.models import LocationLevel
region = LocationLevel.objects.get(name='Region')
ll = LocationLevel.objects.get_all_children(region)
print ll
'''


class LocationLevelManager(models.Manager):
    
    def get_queryset(self):
        return LocationLevelQuerySet(self.model, self._db)

    def get_all_children(self, parent, all_children=None):
        return self.get_queryset().get_all_children(parent, all_children)


class LocationLevel(AbstractName):
    '''
    Use symmetrical = false to indicate one way relationship

    :docs: https://docs.djangoproject.com/en/1.8/ref/models/fields/#django.db.models.ManyToManyField.symmetrical
    '''
    children = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='parents')

    # Manager
    objects = LocationLevelManager()


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
