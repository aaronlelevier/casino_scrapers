from django.shortcuts import get_object_or_404
from django.db.models.functions import Lower
from django.db.models import Q

from rest_framework import permissions
from rest_framework.decorators import list_route
from rest_framework.response import Response
import rest_framework_filters as filters

from person import helpers, serializers as ps
from person.models import Person, PersonStatus, Role
from util.mixins import OrderingQuerySetMixin
from util.views import BaseModelViewSet
from rest_framework import pagination


class RoleViewSet(BaseModelViewSet):
    """
    API endpoint that allows roles to be viewed or edited.
    """
    queryset = Role.objects.all()
    serializer_class = ps.RoleSerializer
    permission_classes = (permissions.IsAuthenticated,)
    paginate_by = 1000


class PersonStatusViewSet(BaseModelViewSet):
    queryset = PersonStatus.objects.all()
    serializer_class = ps.PersonStatusSerializer
    permission_classes = (permissions.IsAuthenticated,)


### PERSON

class PersonFilterSet(filters.FilterSet):
    first_name = filters.AllLookupsFilter(name='first_name')
    username = filters.AllLookupsFilter(name='username')
    fullname = filters.AllLookupsFilter(name='name')
    title = filters.AllLookupsFilter(name='title')
    
    class Meta:
        model= Person
        fields = ['first_name', 'username', 'fullname']


class PersonViewSet(BaseModelViewSet):
    '''
    ## Detail Routes

    **1. current:**

       Returns the *logged-in* Person's Detail Serializer

       URL: `/api/admin/people/current/`
    '''
    queryset = Person.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    filter_class = PersonFilterSet

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'retrieve':
            return ps.PersonDetailSerializer
        elif self.action == ('update' or 'partial_update'):
            return ps.PersonUpdateSerializer
        elif self.action == 'create':
            return ps.PersonCreateSerializer
        else:
            return ps.PersonListSerializer

    def get_queryset(self):
        """
        :search: will use the ``Q`` lookup class:

        https://docs.djangoproject.com/en/1.8/topics/db/queries/#complex-lookups-with-q-objects
        """
        queryset = super(PersonViewSet, self).get_queryset()

        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) | \
                Q(username__icontains=search) | \
                Q(name__icontains=search)
            )

        return queryset

    @list_route(methods=['GET'])
    def current(self, request, pk=None):
        instance = get_object_or_404(Person, id=request.user.id)
        serializer = ps.PersonDetailSerializer(instance)
        return Response(serializer.data)