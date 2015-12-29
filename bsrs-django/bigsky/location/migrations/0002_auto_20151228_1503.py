# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='locationlevel',
            name='assets',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='locationlevel',
            name='catalog_categories',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='locationlevel',
            name='contact',
            field=models.BooleanField(default=True, help_text='Defines whether locations in this type will have related Contact models.'),
        ),
        migrations.AddField(
            model_name='locationlevel',
            name='create_tickets',
            field=models.BooleanField(default=True, help_text='Can Tickets be assigned to this Location'),
        ),
        migrations.AddField(
            model_name='locationlevel',
            name='landlord',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='locationlevel',
            name='warranty',
            field=models.BooleanField(default=True),
        ),
    ]
