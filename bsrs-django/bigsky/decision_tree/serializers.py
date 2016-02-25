from rest_framework import serializers

from decision_tree.models import TreeField, TreeOption, TreeLink, TreeData
from generic.models import Attachment
from utils.serializers import BaseCreateSerializer


class TreeFieldSerializer(BaseCreateSerializer):

    class Meta:
        model = TreeField
        fields = ('id', 'label', 'type', 'options', 'required',)


class TreeOptionSerializer(BaseCreateSerializer):

    class Meta:
        model = TreeOption
        fields = ('id', 'text', 'order',)


class TreeLinkSerializer(BaseCreateSerializer):

    class Meta:
        model = TreeLink
        fields = ('id', 'order', 'text', 'action_button', 'is_header', 'categories',
                  'request', 'priority', 'status', 'destination', 'child_data',)


class TreeDataListSerializer(BaseCreateSerializer):

    class Meta:
        model = TreeData
        fields = ('id', 'key', 'description', 'links',)


class TreeDataSerializer(BaseCreateSerializer):

    files = serializers.PrimaryKeyRelatedField(
        queryset=Attachment.objects.all(), many=True, required=False)
    fields = serializers.PrimaryKeyRelatedField(
        queryset=TreeField.objects.all(), many=True, required=False)

    class Meta:
        model = TreeData
        fields = ('id', 'key', 'description', 'note', 'note_type', 'files', 'fields',
            'prompt', 'link_type', 'links',)

    
