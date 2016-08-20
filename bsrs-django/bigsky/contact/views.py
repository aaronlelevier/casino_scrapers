from rest_framework.decorators import list_route
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated

from contact.serializers import (
    PhoneNumberTypeSerializer, PhoneNumberSerializer, AddressTypeSerializer,
    AddressSerializer, EmailTypeSerializer, EmailSerializer,
    CountryListSerializer, CountryDetailSerializer, CountryIdNameSerializer,
    StateListSerializer, StateIdNameSerializer,)
from contact.models import (
    PhoneNumber, PhoneNumberType, Address, AddressType, Email, EmailType,
    Country, State)
from utils.views import BaseModelViewSet


class CountryViewSet(BaseModelViewSet):

    model = Country
    permissions = (IsAuthenticated,)
    queryset = Country.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return CountryListSerializer
        elif self.action == 'retrieve':
            return CountryDetailSerializer
        else:
            raise MethodNotAllowed(method=self.action)

    def destroy(self, request, *args, **kwargs):
        raise MethodNotAllowed(method="delete")

    @list_route(methods=['GET'])
    def tenant(self, request):
        queryset = Country.objects.filter(tenants=request.user.role.tenant)

        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(common_name__icontains=search)

        queryset = queryset.order_by('common_name')
        queryset = self.paginate_queryset(queryset)
        serializer = CountryIdNameSerializer(queryset, many=True)
        return self.get_paginated_response(serializer.data)


class StateViewSet(BaseModelViewSet):

    model = State
    permissions = (IsAuthenticated,)
    queryset = State.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return StateListSerializer
        else:
            raise MethodNotAllowed(method=self.action)

    def destroy(self, request, *args, **kwargs):
        raise MethodNotAllowed(method="delete")

    @list_route(methods=['GET'])
    def tenant(self, request):
        tenant_countries_ids = request.user.role.tenant.countries.values_list('id', flat=True)
        queryset = State.objects.filter(country__id__in=tenant_countries_ids)

        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)

        queryset = queryset.order_by('name')
        queryset = self.paginate_queryset(queryset)
        serializer = StateIdNameSerializer(queryset, many=True)
        return self.get_paginated_response(serializer.data)


class PhoneNumberTypeViewSet(BaseModelViewSet):

    model = PhoneNumberType
    permission_classes = (IsAuthenticated,)
    serializer_class = PhoneNumberTypeSerializer
    queryset = PhoneNumberType.objects.all()


class PhoneNumberViewSet(BaseModelViewSet):

    model = PhoneNumber
    permission_classes = (IsAuthenticated,)
    serializer_class = PhoneNumberSerializer
    queryset = PhoneNumber.objects.all()
    filter_fields = [f.name for f in model._meta.get_fields()]


class AddressTypeViewSet(BaseModelViewSet):

    model = AddressType
    permission_classes = (IsAuthenticated,)
    serializer_class = AddressTypeSerializer
    queryset = AddressType.objects.all()


class AddressViewSet(BaseModelViewSet):

    model = Address
    permission_classes = (IsAuthenticated,)
    serializer_class = AddressSerializer
    queryset = Address.objects.all()
    filter_fields = [f.name for f in model._meta.get_fields()]


class EmailTypeViewSet(BaseModelViewSet):

    model = EmailType
    permission_classes = (IsAuthenticated,)
    serializer_class = EmailTypeSerializer
    queryset = EmailType.objects.all()
    

class EmailViewSet(BaseModelViewSet):

    model = Email
    permission_classes = (IsAuthenticated,)
    serializer_class = EmailSerializer
    queryset = Email.objects.all()
    filter_fields = [f.name for f in model._meta.get_fields()]
