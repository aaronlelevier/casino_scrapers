'''
Big Sky Retail Systems Framework
Contact views

Created on Jan 21, 2015

@author: tkrier

'''
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
import serializers as contactSerializers
import models as contactModels


class PhoneNumberViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows locations to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = contactSerializers.PhoneNumberSerializer
    queryset = contactModels.PhoneNumber.objects.all()
    
    def get_queryset(self):
        """
        Restricts locations to a given type
        """
        queryset = contactModels.PhoneNumber.objects.all()
        pn_type = self.request.QUERY_PARAMS.get('type', None)
        if pn_type is not None:
            queryset = queryset.filter(type__name__exact=pn_type)
        return queryset


class PhoneNumberTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows location types to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = contactSerializers.PhoneNumberTypeSerializer
    queryset = contactModels.PhoneNumberType.objects.all()
    

class AddressViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows locations to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = contactSerializers.AddressSerializer
    queryset = contactModels.Address.objects.all()
    
    def get_queryset(self):
        """
        Restricts locations to a given type
        """
        queryset = contactModels.Address.objects.all()
        address_type = self.request.QUERY_PARAMS.get('type', None)
        if address_type is not None:
            queryset = queryset.filter(type__name__exact=address_type)
        return queryset
    

class AddressTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows location types to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = contactSerializers.AddressTypeSerializer
    queryset = contactModels.AddressType.objects.all()
    

class EmailViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows locations to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = contactSerializers.EmailSerializer
    queryset = contactModels.Email.objects.all()
    
    def get_queryset(self):
        """
        Restricts locations to a given type
        """
        queryset = contactModels.Email.objects.all()
        email_type = self.request.QUERY_PARAMS.get('type', None)
        if email_type is not None:
            queryset = queryset.filter(type__name__exact=email_type)
        return queryset
    
class EmailTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows location types to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = contactSerializers.EmailTypeSerializer
    queryset = contactModels.EmailType.objects.all()
    
    