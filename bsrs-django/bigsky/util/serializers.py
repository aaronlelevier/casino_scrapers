from rest_framework import serializers


class BaseCreateSerializer(serializers.ModelSerializer):
    '''
    Base Serializer for all Create Serializer. 

    Make ID a "writeable" UUIDField.
    '''
    id = serializers.UUIDField(read_only=False)