'''
Created on Jun 22, 2015

@author: tkrier
'''
from rest_framework import serializers

import models as roleModels

class RoleSerializer(serializers.ModelSerializer):

    class Meta:
        model = roleModels.Role
        fields = ('id', 'name', 'locationlevel', 'roletype',)
    
