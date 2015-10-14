from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils.translation import ugettext, ugettext_lazy as _

from rest_framework import permissions, status
from rest_framework.decorators import list_route
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from person import helpers, serializers as ps
from person.models import Person, PersonStatus, Role
from utils.views import BaseModelViewSet


class RoleViewSet(BaseModelViewSet):
    """
    API endpoint that allows roles to be viewed or edited.
    """
    queryset = Role.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'retrieve':
            return ps.RoleDetailSerializer
        elif self.action == ('update' or 'partial_update'):
            return ps.RoleUpdateSerializer
        else:
             return ps.RoleSerializer


class PersonStatusViewSet(BaseModelViewSet):
    
    queryset = PersonStatus.objects.all()
    serializer_class = ps.PersonStatusSerializer
    permission_classes = (permissions.IsAuthenticated,)


### PERSON

class PersonViewSet(BaseModelViewSet):
    '''
    ## Detail Routes

    **1. current:**

       Returns the *logged-in* Person's Detail Serializer

       URL: `/api/admin/people/current/`

    **2. reset-password:**

       Reset a Person's password using `{person_id}` the Person.

       URL: `/api/admin/people/reset-password/{person_id}/`

    **3. ticket people:**

       Return people based on search

       URL: `/api/admin/people&fullname__icontains={x}`

    '''
    error_messages = {
        'password_mismatch': _("The two password fields didn't match."),
        'password_missing': _("Please enter the new password twice.")
    }

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

    # TODO
    # add correct authorization to who can use this endpoint
    @list_route(methods=['post'], url_path=r"reset-password/(?P<person_id>[\w\-]+)")
    def reset_password(self, request, pk=None, person_id=None):
        person = get_object_or_404(Person, id=person_id)
        self._validate_passwords_match(request.data)
        self._reset_password(person_id, request.data.get('new_password1'))
        return Response(status=status.HTTP_200_OK)

    def _validate_passwords_match(self, data):
        try:
            new_password1 = data.get('new_password1')
            new_password2 = data.get('new_password2')
        except KeyError:
            raise ValidationError(self.error_messages['password_missing'])

        if new_password1 != new_password2:
            raise ValidationError(self.error_messages['password_mismatch'])

    def _reset_password(self, person_id, password):
        instance = Person.objects.get(id=person_id)
        instance.set_password(password)
        instance.save()
