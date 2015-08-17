# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='categorytype',
            name='child',
            field=models.OneToOneField(related_name='parent', null=True, blank=True, to='category.CategoryType'),
        ),
    ]
