# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='categorystatus',
            name='description',
            field=models.CharField(default='Active', choices=[('Active', 'Active'), ('Inactive', 'Inactive')], max_length=100),
        ),
    ]
