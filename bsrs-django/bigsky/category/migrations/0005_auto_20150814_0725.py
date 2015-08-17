# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0004_auto_20150814_0718'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='categorytype',
            name='child',
        ),
        migrations.AddField(
            model_name='categorytype',
            name='parent',
            field=models.OneToOneField(related_name='child', null=True, blank=True, to='category.CategoryType'),
        ),
    ]
