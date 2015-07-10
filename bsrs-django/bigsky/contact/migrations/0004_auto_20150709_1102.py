# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0003_auto_20150708_1026'),
    ]

    operations = [
        migrations.AlterField(
            model_name='addresstype',
            name='name',
            field=models.CharField(unique=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='emailtype',
            name='name',
            field=models.CharField(unique=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='phonenumbertype',
            name='name',
            field=models.CharField(unique=True, max_length=100),
        ),
    ]
