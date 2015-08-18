# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workorder',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, serialize=False, editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name='workorderstatus',
            name='id',
            field=models.UUIDField(primary_key=True, default=uuid.uuid4, serialize=False, editable=False, unique=True),
        ),
    ]
