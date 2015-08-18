# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0002_auto_20150818_1436'),
    ]

    operations = [
        migrations.AlterField(
            model_name='currency',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True),
        ),
    ]
