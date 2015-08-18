# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0002_auto_20150810_1050'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, serialize=False, editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name='personstatus',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, serialize=False, editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name='proxyrole',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, serialize=False, editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name='role',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, serialize=False, editable=False, unique=True),
        ),
    ]
