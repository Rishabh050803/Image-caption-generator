# Generated by Django 5.1.6 on 2025-03-11 10:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='ratedcaption',
            old_name='hashtags',
            new_name='generated_hashtags',
        ),
    ]
