# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0005_remove_category_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='status',
            field=models.ForeignKey(blank=True, null=True, to='category.CategoryStatus'),
        ),
    ]
