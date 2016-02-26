from rest_framework import serializers

from category.models import Category
from decision_tree.models import TreeField, TreeOption, TreeLink, TreeData
from generic.models import Attachment
from utils.serializers import BaseCreateSerializer


class TreeOptionSerializer(BaseCreateSerializer):

    class Meta:
        model = TreeOption
        fields = ('id', 'text', 'order',)


class TreeFieldSerializer(BaseCreateSerializer):

    options = TreeOptionSerializer(many=True, required=False)

    class Meta:
        model = TreeField
        fields = ('id', 'label', 'type', 'options', 'required',)


class TreeLinkSerializer(BaseCreateSerializer):

    categories = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = TreeLink
        fields = ('id', 'order', 'text', 'action_button', 'is_header', 'categories',
                  'request', 'priority', 'status', 'parent', 'destination',)


class TreeDataListSerializer(BaseCreateSerializer):

    class Meta:
        model = TreeData
        fields = ('id', 'key', 'description', 'links',)


class TreeDataSerializer(BaseCreateSerializer):

    files = serializers.PrimaryKeyRelatedField(
        queryset=Attachment.objects.all(), many=True, required=False)
    fields = TreeFieldSerializer(many=True, required=False)
    from_link = TreeLinkSerializer(required=False)
    links = TreeLinkSerializer(many=True, required=False)

    class Meta:
        model = TreeData
        fields = ('id', 'key', 'description', 'note', 'note_type', 'files', 'fields',
                  'prompt', 'link_type', 'from_link', 'links',)

    #  TODO: Implement custom for: create, update (nested)

    # def create(self, validated_data):
    #     pass

    # def update(self, instance, validated_data):
    #     pass
