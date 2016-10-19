from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import get_object_or_404
from django.utils.translation import ugettext_lazy as _

from rest_framework import permissions, status
from rest_framework.decorators import list_route
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from person import serializers as ps
from person.models import Person, Role
from utils.mixins import EagerLoadQuerySetMixin, SearchMultiMixin
from utils.views import BaseModelViewSet, paginate_queryset_as_response


class RoleViewSet(EagerLoadQuerySetMixin, SearchMultiMixin, BaseModelViewSet):
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
            return ps.RoleListSerializer

    def create(self, request, *args, **kwargs):
        """Assign new Role's tenant to match the logged
        in User's Tenant."""
        response = super(RoleViewSet, self).create(request, *args, **kwargs)

        role = Role.objects.get(id=response.data['id'])
        role.tenant = request.user.role.tenant
        role.save()

        return response

    @list_route(methods=['get'], url_path=r"route-data/new")
    def route_data_new(self, request):
        tenant = request.user.role.tenant
        return Response({
            'settings': {
                'dashboard_text': tenant.dashboard_text
            }
        })


### PERSON

class PersonViewSet(EagerLoadQuerySetMixin, SearchMultiMixin, BaseModelViewSet):
    '''
    ## Detail Routes

    **1. current:**

       Returns the *logged-in* Person's Detail Serializer

       URL: `/api/admin/people/current/`

    **2. sms_recipients:**

       Returns people with phone numbers of type "cell"

       URL: `/api/admin/people/sms-recipients/`

    **3. email_recipients:**

       Returns people with emails

       URL: `/api/admin/people/email-recipients/`

    **4. search_power_select:**

       Standard Person power-select endpoint.

       URL: `/api/admin/people/person__icontains={search_key}/`

    **5. reset_password:**

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

    @list_route(methods=['GET'])
    def current(self, request):
        instance = get_object_or_404(Person, id=request.user.id)
        serializer = ps.PersonCurrentSerializer(instance)
        return Response(serializer.data)

    @list_route(methods=['GET'], url_path=r"sms-recipients")
    @paginate_queryset_as_response(ps.PersonSearchSerializer)
    def sms_recipients(self, request):
        """
        Returns people with a related PhoneNumber of PhoneNumberType.CELL
        """
        keyword = request.query_params.get('search', None)
        return Person.objects.get_sms_recipients(tenant=request.user.role.tenant, keyword=keyword)

    @list_route(methods=['GET'], url_path=r"email-recipients")
    @paginate_queryset_as_response(ps.PersonSearchSerializer)
    def email_recipients(self, request):
        """
        Returns people with a Emails
        """
        keyword = request.query_params.get('search', None)
        return Person.objects.get_email_recipients(tenant=request.user.role.tenant, keyword=keyword)

    @list_route(methods=['GET'], url_path=r"person__icontains=(?P<search_key>[\w\s\.\-@]+)")
    @paginate_queryset_as_response(ps.PersonSearchSerializer)
    def search_power_select(self, request, search_key=None):
        return Person.objects.search_power_select(search_key)

    # TODO # add correct authorization to who can use this endpoint
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
