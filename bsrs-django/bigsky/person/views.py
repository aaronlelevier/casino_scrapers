from django.shortcuts import get_object_or_404
from django.db.models import Q

from rest_framework import permissions
from rest_framework.decorators import list_route
from rest_framework.response import Response
import rest_framework_filters as filters

from person import helpers, serializers as ps
from person.models import Person, PersonStatus, Role
from utils.views import BaseModelViewSet


class RoleViewSet(BaseModelViewSet):
    """
    API endpoint that allows roles to be viewed or edited.
    """
    queryset = Role.objects.all()
    serializer_class = ps.RoleSerializer
    permission_classes = (permissions.IsAuthenticated,)


class PersonStatusViewSet(BaseModelViewSet):
    queryset = PersonStatus.objects.all()
    serializer_class = ps.PersonStatusSerializer
    permission_classes = (permissions.IsAuthenticated,)


### PERSON

class PersonFilterSet(filters.FilterSet):
    username = filters.AllLookupsFilter(name='username')
    fullname = filters.AllLookupsFilter(name='fullname')
    title = filters.AllLookupsFilter(name='title')
    
    class Meta:
        model= Person
        fields = ['username', 'fullname', 'title']


class PersonViewSet(BaseModelViewSet):
    '''
    ## Detail Routes

    **1. current:**

       Returns the *logged-in* Person's Detail Serializer

       URL: `/api/admin/people/current/`
    '''
    queryset = Person.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    model = Person
    filter_fields = [f.name for f in model._meta.get_fields()]

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
                Q(username__icontains=search) | \
                Q(fullname__icontains=search) | \
                Q(title__icontains=search)
            )

        return queryset

    @list_route(methods=['GET'])
    def current(self, request, pk=None):
        instance = get_object_or_404(Person, id=request.user.id)
        serializer = ps.PersonDetailSerializer(instance)
        return Response(serializer.data)
