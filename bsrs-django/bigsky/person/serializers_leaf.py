"""
`Leaf` node serializers to be shared by the main serializers in different 
modules, and so as not to cause import conflicts from importing back and 
forth between modules.
"""
from rest_framework import serializers

from person.models import Person


class PersonSimpleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Person
        fields = ('id', 'fullname',)


class PersonIdUsernameSerializer(serializers.ModelSerializer):

    class Meta:
        model = Person
        fields = ('id', 'username',)
