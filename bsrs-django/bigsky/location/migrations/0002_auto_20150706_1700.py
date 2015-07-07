# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0001_initial'),
        ('person', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='location',
            name='people',
            field=models.ManyToManyField(related_name='locations', to='person.Person'),
        ),
        migrations.AddField(
            model_name='location',
            name='relations',
            field=models.ManyToManyField(related_name='relations_rel_+', to='location.Location'),
        ),
        migrations.AddField(
            model_name='location',
            name='status',
            field=models.ForeignKey(related_name='locations', to='location.LocationStatus'),
        ),
        migrations.AddField(
            model_name='location',
            name='type',
            field=models.ForeignKey(related_name='locations', to='location.LocationType'),
        ),
    ]
