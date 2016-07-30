import csv
from contact.models import Country, State

encoding = 'ISO-8859-2'


def import_countries():
    file_str = "/Users/alelevier/Desktop/countries.csv"

    with open(file_str, encoding=encoding) as csvfile:
        reader = csv.DictReader(csvfile)
        for i, row in enumerate(reader):
            try:
                Country.objects.create(
                    sort_order=row["Sort Order"],
                    formal_name=row["Formal Name"],
                    common_name=row["Common Name"],
                    type=row["Type"],
                    sub_type=row["Sub Type"],
                    sovereignty=row["Sovereignty"],
                    capital=row["Capital"],
                    currency_code=row["ISO 4217 Currency Code"],
                    currency_name=row["ISO 4217 Currency Name"],
                    telephone_code=row["ITU-T Telephone Code"],
                    two_letter_code=row["ISO 3166-1 2 Letter Code"],
                    three_letter_code=row["ISO 3166-1 3 Letter Code"],
                    number=row["ISO 3166-1 Number"],
                    country_code_tld=row["IANA Country Code TLD"],
                )
            except Exception as e:
                print(i, ":", e)


def import_states():
    file_str = "/Users/alelevier/Desktop/states.csv"

    with open(file_str, encoding=encoding) as csvfile:
        reader = csv.DictReader(csvfile)
        for i, row in enumerate(reader):
            try:
                State.objects.create(
                    country_code=row['Country Code'],
                    state_code=row['State Code'],
                    name=row['Name'],
                    classification=row['Classification']
                )
            except Exception as e:
                print(i, ":", e)


def join_states_to_countries():
    for s in State.objects.filter(country__isnull=True):
        try:
            country = Country.objects.get(two_letter_code=s.country_code)
        except Country.DoesNotExist:
            pass
        except Country.MultipleObjectsReturned:
            print(s.country_code)
        else:
            s.country = country
            s.save()
