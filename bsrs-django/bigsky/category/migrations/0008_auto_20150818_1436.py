# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0007_auto_20150817_1626'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, serialize=False, editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name='category',
            name='subcategory_label',
            field=models.CharField(default=1, max_length=100),
            preserve_default=False,
        ),
    ]
