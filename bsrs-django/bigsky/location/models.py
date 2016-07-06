from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.contenttypes.fields import GenericRelation
from django.db import models
from django.db.models import Q

from contact.models import PhoneNumber, Address, Email
from utils.models import (BaseModel, BaseManager, BaseNameModel, DefaultNameManager,
    DefaultToDictMixin)


LOCATION_COMPANY = 'Company'
LOCATION_REGION = 'Region'
LOCATION_DISTRICT = 'District'
LOCATION_STORE = 'Store'
LOCATION_FMU = 'Facility Management Unit'


### SELF REFERENCING BASE

class SelfReferencingQuerySet(models.query.QuerySet):
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

    def objects_and_their_children(self):
        """
        Meant to be called from a RelatedManager standpoint, otherwise
        would just return all model objects.

        Ex: person.locations.objects_and_their_children()

        Exp: returns the Person's related Locations and their Children.
        """
        master_set = set()

        for obj in self.all():

            if obj.name == LOCATION_COMPANY:
                master_set.update(type(obj).objects.values_list('id', flat=True))
                continue

            # parent
            master_set.add(obj.id)
            # children
            children = type(obj).objects.get_all_children(obj)
            master_set.update(children.values_list('id', flat=True))

        return master_set


class SelfReferencingManager(BaseManager):

    def get_queryset(self):
        return SelfReferencingQuerySet(self.model, self._db).filter(deleted__isnull=True)

    def get_all_children(self, parent, all_children=None):
        return self.get_queryset().get_all_children(parent, all_children)

    def get_all_parents(self, child, first_child_id=None, all_parents=None):
        return self.get_queryset().get_all_parents(child, first_child_id, all_parents)

    def create_top_level(self):
        obj, _ = self.get_or_create(name=LOCATION_COMPANY)
        return obj

    def objects_and_their_children(self):
        return self.get_queryset().objects_and_their_children()


class SelfRefrencingBaseModel(models.Model):
    '''
    ``symmetrical = false``: to indicate one way relationship

    `Symetrical Documentation Here <https://docs.djangoproject.com/en/1.8/ref/models/fields/
    #django.db.models.ManyToManyField.symmetrical>`_
    '''
    children = models.ManyToManyField('self', blank=True,
        symmetrical=False, related_name='parents')

    # Manager
    objects = SelfReferencingManager()

    class Meta:
        abstract = True


### LOCATION LEVEL

class LocationLevel(SelfRefrencingBaseModel, BaseNameModel):
    '''
    LocationLevel records must be unique by: name, role_type
    '''
    contact = models.BooleanField(blank=True, default=True,
        help_text="Defines whether locations in this type will have related Contact models.")
    can_create_tickets = models.BooleanField(blank=True, default=True,
        help_text="Can Tickets be assigned to this Location")

    # TODO: (ayl) not sure what these four fields do?
    landlord = models.BooleanField(blank=True, default=True)
    warranty = models.BooleanField(blank=True, default=True)
    catalog_categories = models.BooleanField(blank=True, default=True)
    assets = models.BooleanField(blank=True, default=True)

    @property
    def is_top_level(self):
        return self.name == LOCATION_COMPANY

    def to_dict(self):
        children = [str(child.id) for child in self.children.all()]
        parents = [str(parent.id) for parent in self.parents.all()]
        return {"id": str(self.id), "name": self.name, "children": children, "parents": parents}


### LOCATION STATUS

class LocationStatus(DefaultToDictMixin, BaseNameModel):

    default = settings.DEFAULT_LOCATION_STATUS

    objects = DefaultNameManager()


### LOCATION TYPE

class LocationType(BaseNameModel):

    default = settings.DEFAULT_LOCATION_TYPE

    objects = DefaultNameManager()


### LOCATION

class LocationQuerySet(SelfReferencingQuerySet):

    def get_level_children(self, level_id, pk):
        '''
        :location: Parent ``Location`` to find one all of the locations one llevel deep
        '''
        try:
            new_llevel = LocationLevel.objects.get(id=level_id)
            child_levels = LocationLevel.objects.get_all_children(new_llevel)
        except ObjectDoesNotExist:
            raise
        return self.filter(location_level__in=child_levels).exclude(id=pk)

    def get_level_parents(self, level_id, pk):
        '''
        :location: Child ``Location``
            level_id might be different than whats stored in the db
        '''
        try:
            new_llevel = LocationLevel.objects.get(id=level_id)
            parent_levels = LocationLevel.objects.get_all_parents(new_llevel)
        except ObjectDoesNotExist:
            raise
        return self.filter(location_level__in=parent_levels).exclude(id=pk)

    def search_multi(self, keyword):
        return self.filter(
            Q(name__icontains=keyword) | \
            Q(number__icontains=keyword) | \
            Q(addresses__city__icontains=keyword) | \
            Q(addresses__address__icontains=keyword) | \
            Q(addresses__postal_code__icontains=keyword)
        )

    def search_power_select(self, keyword, llevel_id):
        q_obj = Q(name__icontains=keyword) | \
            Q(number__icontains=keyword) | \
            Q(addresses__city__icontains=keyword) | \
            Q(addresses__address__icontains=keyword) | \
            Q(addresses__postal_code__icontains=keyword)

        if llevel_id:
            q_obj &= Q(location_level=llevel_id)

        return self.filter(q_obj)

    def objects_and_their_children(self):
        """
        Meant to be called from a RelatedManager standpoint, otherwise
        would just return all model objects.

        Ex: person.locations.objects_and_their_children()

        Exp: returns the Person's related Locations and their Children.
        """
        master_set = set()

        for obj in self.all():

            if obj.name == LOCATION_COMPANY:
                master_set.update(type(obj).objects.can_create_tickets_ids())
                continue

            # parent
            if obj.location_level.can_create_tickets:
                master_set.add(obj.id)
            # children
            children = type(obj).objects.get_all_children(obj)
            master_set.update(children.can_create_tickets_ids())

        return master_set

    def can_create_tickets_ids(self):
        return (self.select_related('location_level')
                    .filter(location_level__can_create_tickets=True)
                    .values_list("id", flat=True))


class LocationManager(SelfReferencingManager):

    def get_queryset(self):
        return LocationQuerySet(self.model, self._db).filter(deleted__isnull=True)

    def get_level_children(self, llevel_id, pk):
        '''
        Get all child Locations at a specific LocationLevel.
        '''
        return self.get_queryset().get_level_children(llevel_id, pk)

    def get_level_parents(self, llevel_id, pk):
        '''
        Get all Parent Locations at a specific LocationLevel.
        '''
        return self.get_queryset().get_level_parents(llevel_id, pk)

    def search_multi(self, keyword):
        return self.get_queryset().search_multi(keyword)

    def search_power_select(self, keyword, llevel_id):
        '''
        llevel_id may be undefined. Only person location select passes llevel_id
        '''
        return self.get_queryset().search_power_select(keyword, llevel_id)

    def create_top_level(self):
        location_level = LocationLevel.objects.create_top_level()
        obj, _ = self.get_or_create(name=LOCATION_COMPANY, number=LOCATION_COMPANY,
            location_level=location_level)
        return obj

    def objects_and_their_children(self):
        return self.get_queryset().objects_and_their_children()

    def can_create_tickets_ids(self):
        return self.get_queryset().can_create_tickets_ids()


class Location(SelfRefrencingBaseModel, BaseModel):
    '''
    Physical Store ``Locations`` that have a ``LocationLevel``.

    :ex:
        At the *Region* ``LocationLevel`` there is a
        *East* ``Location``.
    '''
    # keys
    location_level = models.ForeignKey(LocationLevel, related_name='locations')
    status = models.ForeignKey(LocationStatus, related_name='locations', blank=True, null=True)
    type = models.ForeignKey(LocationType, related_name='locations', blank=True, null=True)
    phone_numbers = GenericRelation(PhoneNumber)
    addresses = GenericRelation(Address)
    emails = GenericRelation(Email)
    # fields
    name = models.CharField(max_length=1000)
    number = models.CharField(max_length=1000, blank=True, null=True)

    objects = LocationManager()

    class Meta:
        ordering = ("name", "number",)

    def __str__(self):
        return "{}: {}".format(self.name, self.location_level.name)

    def save(self, *args, **kwargs):
        self._update_defaults()
        return super(Location, self).save(*args, **kwargs)

    def _update_defaults(self):
        if not self.status:
            self.status = LocationStatus.objects.default()
        if not self.type:
            self.type = LocationType.objects.default()
