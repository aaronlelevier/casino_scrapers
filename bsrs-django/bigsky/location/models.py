
from django.db import models
from django.conf import settings
from django.utils.encoding import python_2_unicode_compatible

from util.models import AbstractName, BaseModel, BaseManager


class SelfRefrencingQuerySet(models.query.QuerySet):

    def get_all_children(self, parent, all_children=None):
        '''
        :parent: Getting all children for this Object.

        :all_children: default to None always until recursively called

        Returns all Childen for a single Parent ``LocationLevel`` regardless of Level.
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
        :child: getting all parents for this Object

        :first_child_id: the ``child_id`` that we are looking up all parents for, 
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
    
    def get_queryset(self):
        return SelfRefrencingQuerySet(self.model, self._db)
        
    def get_all_children(self, parent, all_children=None):
        return self.get_queryset().get_all_children(parent, all_children)

    def get_all_parents(self, child, first_child_id=None, all_parents=None):
        return self.get_queryset().get_all_parents(child, first_child_id, all_parents)


class SelfRefrencingBaseModel(models.Model):
    '''
    Use symmetrical = false to indicate one way relationship

    :docs: https://docs.djangoproject.com/en/1.8/ref/models/fields/#django.db.models.ManyToManyField.symmetrical
    '''
    children = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='parents')

    # Manager
    objects = SelfRefrencingManager()

    class Meta:
        abstract = True


class LocationLevel(SelfRefrencingBaseModel, AbstractName):
    pass


class LocationStatusManager(BaseManager):

    def default(self):
        obj, created = self.get_or_create(name=settings.DEFAULT_LOCATION_STATUS)
        return obj


class LocationStatus(AbstractName):
    
    objects = LocationStatusManager()

    

class LocationTypeManager(BaseManager):

    def default(self):
        obj, created = self.get_or_create(name=settings.DEFAULT_LOCATION_TYPE)
        return obj


class LocationType(AbstractName):
    
    objects = LocationTypeManager()
    

@python_2_unicode_compatible
class Location(SelfRefrencingBaseModel, BaseModel):
    # keys
    level = models.ForeignKey(LocationLevel, related_name='locations')
    status = models.ForeignKey(LocationStatus, related_name='locations', blank=True, null=True,
        help_text="If not provided, will be the default 'LocationStatus'.")
    type = models.ForeignKey(LocationType, related_name='locations', blank=True, null=True)
    # fields
    name = models.CharField(max_length=100)
    number = models.CharField(max_length=20)

    class Meta:
        ordering = ('number',)
    
    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.status:
            self.status = LocationStatus.objects.default()
        if not self.type:
            self.type = LocationType.objects.default()

        return super(Location, self).save(*args, **kwargs)

