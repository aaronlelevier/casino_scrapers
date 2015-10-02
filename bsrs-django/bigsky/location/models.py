import json

from django.db import models
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.utils.encoding import python_2_unicode_compatible

from utils.models import AbstractName, BaseModel, BaseManager


### SUPPORT MODELS

class State(AbstractName):
    abbr = models.CharField(max_length=2)

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'abbr': self.abbr
        }

class Country(AbstractName):

    class Meta:
        verbose_name_plural = 'Countries'


### SELF REFERENCING BASE

class SelfRefrencingQuerySet(models.query.QuerySet):
    "Query Parent / Child relationships for all SelfRefrencing Objects."

    def get_all_children(self, parent, all_children=None):
        '''
        Return all Child Objects regardless of distance in the Tree.

        :parent: Getting all children for this Object.

        :all_children: default to None always until recursively called
        '''
        if not all_children:
            all_children = set()

        new_children = set(parent.children.values_list('id', flat=True))

        if new_children - all_children:
            all_children.update(new_children)
            # for each child, call the function in a tree
            for x in new_children:
                ea = type(parent).objects.get(id=x)
                self.get_all_children(ea, all_children)

        return self.filter(id__in=all_children)

    def get_all_parents(self, child, first_child_id=None, all_parents=None):
        '''
        Return all Parent Objects regardless of distance in the Tree.

        :child: getting all parents for this Object

        :first_child_id: 
            the ``child_id`` that we are looking up all parents for,
            and will be excluded from the output

        :all_parents: default to None always until recursively called
        '''
        first_child_id = child.id

        if not all_parents:
            all_parents = set()

        # filter for ``parents`` where this is their ``child``
        new_parents = set(self.filter(children=child).values_list('id', flat=True))

        if new_parents - all_parents:
            all_parents.update(new_parents)
            # for each child, call the function in a tree
            for x in new_parents:
                ea = type(child).objects.get(id=x)
                self.get_all_parents(ea, first_child_id, all_parents)

        return self.filter(id__in=all_parents).exclude(id=first_child_id)


class SelfRefrencingManager(BaseManager):
    ''' '''
    
    def get_queryset(self):
        return SelfRefrencingQuerySet(self.model, self._db).filter(deleted__isnull=True)
        
    def get_all_children(self, parent, all_children=None):
        return self.get_queryset().get_all_children(parent, all_children)

    def get_all_parents(self, child, first_child_id=None, all_parents=None):
        return self.get_queryset().get_all_parents(child, first_child_id, all_parents)

    @property
    def d3_json(self):
        """
        Output the Models' self referencing structure to JSON for d3js. Note: "type": "suite" 
        is a default argument for the code, but can be used to change the colors of the arrows.

        `d3js reference <http://bl.ocks.org/mbostock/1153292#index.html>`_
        """
        links = []
        for level in self.all():
            if level.children:
                for child in level.children.all():
                    links.append({"source": level.name, "target": child.name, "type": "suit"})
        return json.dumps(links)


class SelfRefrencingBaseModel(models.Model):
    '''
    ``symmetrical = false``: to indicate one way relationship

    `Symetrical Documentation Here <https://docs.djangoproject.com/en/1.8/ref/models/fields/
    #django.db.models.ManyToManyField.symmetrical>`_
    '''
    children = models.ManyToManyField('self', blank=True,
        symmetrical=False, related_name='parents')

    # Manager
    objects = SelfRefrencingManager()

    class Meta:
        ordering = ('id',)
        abstract = True


### LOCATION LEVEL

class LocationLevel(SelfRefrencingBaseModel, AbstractName):
    '''
    LocationLevel records must be unique by: name, role_type
    '''
    pass
    

### LOCATION STATUS

class LocationStatusManager(BaseManager):
    '''
    Return the **default** status for the initial Location 
    ``.create()`` if one isn't specified.
    '''

    def default(self):
        obj, created = self.get_or_create(name=settings.DEFAULT_LOCATION_STATUS)
        return obj


class LocationStatus(AbstractName):
    '''
    Tells whether the store is: *Open, Closed, Future, etc...*

    Single *name* field, with more configuration on this 
    model planned.
    '''
    
    objects = LocationStatusManager()


### LOCATION TYPE

class LocationTypeManager(BaseManager):
    ''' '''

    def default(self):
        obj, created = self.get_or_create(name=settings.DEFAULT_LOCATION_TYPE)
        return obj


class LocationType(AbstractName):
    ''' '''
    
    objects = LocationTypeManager()


### LOCATION

class LocationQuerySet(SelfRefrencingQuerySet):
    ''' '''

    def get_level_children(self, location, level_id):
        '''
        Includes error handling that the level_id is valid.

        :location: Parent ``Location``
        :level_id: 
            ``LocationLevel.id`` of the ``Child Locations`` 
            to return.
        '''
        try:
            child_levels = LocationLevel.objects.get_all_children(location.location_level)
            location_level = LocationLevel.objects.filter(
                id__in=child_levels.values_list('id', flat=True)).get(id=level_id)
        except ObjectDoesNotExist:
            raise
        return self.filter(location_level=location_level)

    def get_level_parents(self, location, level_id):
        '''
        Includes error handling that the level_id is valid.
        
        :location: Child ``Location``
        :level_id: 
            ``LocationLevel.id`` of the ``Parent Locations`` 
            to return.
        '''
        try:
            parent_levels = LocationLevel.objects.get_all_parents(location.location_level)
            location_level = LocationLevel.objects.filter(
                id__in=parent_levels.values_list('id', flat=True)).get(id=level_id)
        except ObjectDoesNotExist:
            raise
        return self.filter(location_level=location_level)


class LocationManager(SelfRefrencingManager):
    ''' '''
    
    def get_queryset(self):
        return LocationQuerySet(self.model, self._db).filter(deleted__isnull=True)
        
    def get_level_children(self, location, level_id):
        '''
        Get all child Locations at a specific LocationLevel.
        '''
        return self.get_queryset().get_level_children(location, level_id)

    def get_level_parents(self, location, level_id):
        '''
        Get all Parent Locations at a specific LocationLevel.
        '''
        return self.get_queryset().get_level_parents(location, level_id)


@python_2_unicode_compatible
class Location(SelfRefrencingBaseModel, BaseModel):
    '''
    Physical Store ``Locations`` that have a ``LocationLevel``.

    :ex:
        At the *Region* ``LocationLevel`` there is a 
        *East* ``Location``.
    '''
    # keys
    location_level = models.ForeignKey(LocationLevel, related_name='locations')
    status = models.ForeignKey(LocationStatus, related_name='locations', blank=True, null=True,
        help_text="If not provided, will be the default 'LocationStatus'.")
    type = models.ForeignKey(LocationType, related_name='locations', blank=True, null=True)
    # fields
    name = models.CharField(max_length=50)
    number = models.CharField(max_length=50, blank=True, null=True)

    objects = LocationManager()

    class Meta:
        ordering = ("name", "number",)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.status:
            self.status = LocationStatus.objects.default()
        if not self.type:
            self.type = LocationType.objects.default()

        return super(Location, self).save(*args, **kwargs)