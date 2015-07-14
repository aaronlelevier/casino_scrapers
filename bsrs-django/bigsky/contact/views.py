'''
Big Sky Retail Systems Framework
Contact views

Created on Jan 21, 2015

@author: tkrier

'''
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from contact.serializers import (
    PhoneNumberTypeSerializer, PhoneNumberSerializer, PhoneNumberShortSerializer,
    AddressTypeSerializer, AddressSerializer, AddressShortSerializer,
    EmailTypeSerializer, EmailSerializer, EmailShortSerializer,
)
from contact.models import (
    PhoneNumber, PhoneNumberType, Address, AddressType,
    Email, EmailType
)


class PhoneNumberTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows location types to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = PhoneNumberTypeSerializer
    queryset = PhoneNumberType.objects.all()


class PhoneNumberViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows locations to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = PhoneNumberSerializer
    queryset = PhoneNumber.objects.all()
    
    def get_queryset(self):
        """
        Restricts locations to a given type
        """
        queryset = PhoneNumber.objects.all()
        pn_type = self.request.QUERY_PARAMS.get('type', None)
        if pn_type is not None:
            queryset = queryset.filter(type__name__exact=pn_type)
        return queryset
    

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
        address_type = self.request.QUERY_PARAMS.get('type', None)
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
        email_type = self.request.QUERY_PARAMS.get('type', None)
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