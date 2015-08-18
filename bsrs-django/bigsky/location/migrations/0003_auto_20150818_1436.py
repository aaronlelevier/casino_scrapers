# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0002_remove_locationlevel_role_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='location',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, serialize=False, editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name='locationlevel',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, serialize=False, editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name='locationstatus',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, serialize=False, editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name='locationtype',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, serialize=False, editable=False, unique=True),
        ),
    ]
