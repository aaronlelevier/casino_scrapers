from decision_tree.models import TreeOption, TreeLink, TreeData
from utils.serializers import BaseCreateSerializer


class TreeOptionSerializer(BaseCreateSerializer):

    class Meta:
        model = TreeOption
        fields = ('id', 'text', 'order',)


class TreeLinkSerializer(BaseCreateSerializer):

    class Meta:
        model = TreeLink
        fields = ('id', 'order', 'text', 'action_button', 'is_header',
            'categories', 'request', 'priority', 'status',
            'tree_data_parent', 'tree_data_links',)


class TreeDataSerializer(BaseCreateSerializer):

    class Meta:
        model = TreeData
        fields = ('id', 'key', 'description',)
