# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0003_auto_20150818_1436'),
    ]

    operations = [
        migrations.AlterField(
            model_name='address',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True),
        ),
        migrations.AlterField(
            model_name='addresstype',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True),
        ),
        migrations.AlterField(
            model_name='email',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True),
        ),
        migrations.AlterField(
            model_name='emailtype',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True),
        ),
        migrations.AlterField(
            model_name='phonenumber',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True),
        ),
        migrations.AlterField(
            model_name='phonenumbertype',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True),
        ),
    ]
