# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.auth.models
import person.models


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0002_auto_20150728_1020'),
    ]

    operations = [
        migrations.AlterModelManagers(
            name='person',
            managers=[
                ('objects', person.models.PersonManager()),
                ('objects_all', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.AlterField(
            model_name='role',
            name='group',
            field=models.OneToOneField(blank=True, to='auth.Group'),
        ),
        migrations.AlterField(
            model_name='role',
            name='name',
            field=models.CharField(help_text=b'Will be set to the Group Name', max_length=100),
        ),
    ]
