# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('role', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='group',
            field=models.OneToOneField(to='auth.Group'),
        ),
    ]
