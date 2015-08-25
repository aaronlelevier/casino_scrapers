from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
import rest_framework_filters as filters

from contact.serializers import (PhoneNumberTypeSerializer, PhoneNumberSerializer,
    AddressTypeSerializer, AddressSerializer, EmailTypeSerializer, EmailSerializer)
from contact.models import (PhoneNumber, PhoneNumberType, Address, AddressType,
    Email, EmailType)
from person.views import PersonFilterSet


class PhoneNumberTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows location types to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = PhoneNumberTypeSerializer
    queryset = PhoneNumberType.objects.all()


### PHONE NUMBER

class PhoneNumberFilterSet(filters.FilterSet):
    number = filters.AllLookupsFilter(name='number')
    person = filters.RelatedFilter(PersonFilterSet, name='person')

    class Meta:
        model = PhoneNumber
        fields = ['number', 'person']


class PhoneNumberViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows locations to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = PhoneNumberSerializer
    queryset = PhoneNumber.objects.all()
    filter_class = PhoneNumberFilterSet
    
    def get_queryset(self):
        """
        Restricts locations to a given type
        """
        queryset = PhoneNumber.objects.all()
        pn_type = self.request.query_params.get('type', None)
        if pn_type is not None:
            queryset = queryset.filter(type__name__exact=pn_type)
        return queryset


### ADDRESS

class AddressFilterSet(filters.FilterSet):
    '''
    TODO: this filter will be used by a LocationList API View that is a 
    detail route and searches Locations by Address Filters.

    (Not Implemented yet)
    '''
    city = filters.AllLookupsFilter(name='city')

    class Meta:
        model = Address
        fields = ['city']


class AddressViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows locations to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = AddressSerializer
    queryset = Address.objects.all()
    
    def get_queryset(self):
        """
        Restricts locations to a given type
        """
        queryset = Address.objects.all()
        address_type = self.request.query_params.get('type', None)
        if address_type is not None:
            queryset = queryset.filter(type__name__exact=address_type)
        return queryset
    

class AddressTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows location types to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = AddressTypeSerializer
    queryset = AddressType.objects.all()
    

class EmailViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows locations to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = EmailSerializer
    queryset = Email.objects.all()
    
    def get_queryset(self):
        """
        Restricts locations to a given type
        """
        queryset = Email.objects.all()
        email_type = self.request.query_params.get('type', None)
        if email_type is not None:
            queryset = queryset.filter(type__name__exact=email_type)
        return queryset
    

class EmailTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows location types to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = EmailTypeSerializer
    queryset = EmailType.objects.all()