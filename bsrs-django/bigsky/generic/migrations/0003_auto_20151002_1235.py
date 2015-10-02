# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('generic', '0002_auto_20151002_1156'),
    ]

    operations = [
        migrations.AlterField(
            model_name='attachment',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='attachment',
            name='model_id',
            field=models.UUIDField(help_text='UUID of the Model Instance that the Attachment is related to.'),
        ),
        migrations.AlterField(
            model_name='customsetting',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='customsetting',
            name='settings',
            field=models.TextField(help_text='JSON Dict saved as a string in DB', blank=True),
        ),
        migrations.AlterField(
            model_name='mainsetting',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='mainsetting',
            name='settings',
            field=models.TextField(help_text='JSON Dict saved as a string in DB', blank=True),
        ),
        migrations.AlterField(
            model_name='savedsearch',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='savedsearch',
            name='endpoint_name',
            field=models.CharField(max_length=254, help_text="the Ember List API route name. i.e. 'admin.people.index'."),
        ),
        migrations.AlterField(
            model_name='savedsearch',
            name='endpoint_uri',
            field=models.CharField(max_length=2048, help_text='API Endpoint that this search is saved for. With all keywords ordering, and filters, etc...'),
        ),
        migrations.AlterField(
            model_name='savedsearch',
            name='name',
            field=models.CharField(max_length=254, help_text='name of the saved search that the Person designates.'),
        ),
        migrations.AlterField(
            model_name='savedsearch',
            name='person',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL, help_text='The Person who saves the search.'),
        ),
    ]
