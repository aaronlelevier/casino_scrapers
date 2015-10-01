# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0014_role_category'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='category',
            field=models.ForeignKey(blank=True, to='category.Category', null=True),
        ),
    ]
