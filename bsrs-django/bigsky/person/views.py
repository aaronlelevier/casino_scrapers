from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import get_object_or_404
from django.utils.translation import ugettext_lazy as _

from rest_framework import permissions, status
from rest_framework.decorators import list_route
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from person import serializers as ps
from person.models import Person, Role
from utils.mixins import EagerLoadQuerySetMixin
from utils.views import BaseModelViewSet


class RoleViewSet(EagerLoadQuerySetMixin, BaseModelViewSet):
    """
    API endpoint that allows roles to be viewed or edited.
    """
    model = Role
    queryset = Role.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    eager_load_actions = ['retrieve']

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'retrieve':
            return ps.RoleDetailSerializer
        elif self.action == 'create':
            return ps.RoleCreateSerializer
        elif self.action in ('update', 'partial_update'):
            return ps.RoleUpdateSerializer
        else:
            return ps.RoleSerializer


### PERSON

class PersonViewSet(EagerLoadQuerySetMixin, BaseModelViewSet):
    '''
    ## Detail Routes

    **1. current:**

       Returns the *logged-in* Person's Detail Serializer

       URL: `/api/admin/people/current/`

    **2. reset-password:**

       Reset a Person's password using `{person_id}` the Person.

       URL: `/api/admin/people/reset-password/{person_id}/`

    '''
    error_messages = {
        'password_mismatch': _("The two password fields didn't match."),
        'password_missing': _("Please enter the new password twice.")
    }

    model = Person
    queryset = Person.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    filter_fields = [f.name for f in model._meta.get_fields()]
    eager_load_actions = ['retrieve']

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
            queryset = queryset.search_multi(keyword=search)

        return queryset

    @list_route(methods=['GET'])
    def current(self, request):
        instance = get_object_or_404(Person, id=request.user.id)
        serializer = ps.PersonCurrentSerializer(instance)
        return Response(serializer.data)

    # TODO
    # add correct authorization to who can use this endpoint
    @list_route(methods=['post'], url_path=r"reset-password/(?P<person_id>[\w\-]+)")
    def reset_password(self, request, person_id=None):
        person = get_object_or_404(Person, id=person_id)
        self._validate_passwords_match(request.data)
        password = request.data.get('new_password1')
        self._validate_role_password_constraints(person, password)
        self._reset_password(person, password)
        return Response(status=status.HTTP_200_OK)

    def _validate_passwords_match(self, data):
        try:
            new_password1 = data.get('new_password1')
            new_password2 = data.get('new_password2')
        except KeyError:
            raise ValidationError(self.error_messages['password_missing'])

        if new_password1 != new_password2:
            raise ValidationError(self.error_messages['password_mismatch'])

    @staticmethod
    def _reset_password(person, password):
        person.set_password(password)
        person.save()

    @staticmethod
    def _validate_role_password_constraints(person, password):
        try:
            person.role.run_password_validators(password)
        except DjangoValidationError as e:
            raise ValidationError(e)
