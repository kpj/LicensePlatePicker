import json
import collections

import pandas as pd

import requests
import requests_cache

from bs4 import BeautifulSoup


URL = 'https://de.wikipedia.org/wiki/Liste_der_Kfz-Kennzeichen_in_Deutschland'

requests_cache.install_cache('temp_cache')


def main():
    # retrieve data
    page = requests.get(URL)
    assert page.status_code == 200

    soup = BeautifulSoup(page.text, 'html.parser')

    # parse data
    df_list = []
    for table in soup.find_all('table', class_='wikitable'):
        tmp = pd.io.html.read_html(str(table))
        assert len(tmp) == 1
        df_tmp = tmp[0]

        if df_tmp.columns[0] != 'Abk.':
            continue

        df_tmp.drop_duplicates('Abk.', inplace=True)
        df_list.append(df_tmp)

    df = pd.concat(df_list, ignore_index=True)
    df.rename(columns={
        'Abk.': 'license',
        'Stadt/Landkreis': 'city',
        'abgeleitet von': 'source',
        'Bundesland': 'county'
    }, inplace=True)

    # generate result
    letter_succession = collections.defaultdict(set)

    license_data = {}
    for row in df.itertuples():
        # gather information about current license
        license_data[row.license] = {
            'city': row.city,
            'county': row.county,
            'source': row.source
        }

        # all licenses below maximal length can be followed by space
        if len(row.license) < 3:
            letter_succession[row.license].update(' ')

        # all license above minimal length define possible follow-up letters
        if len(row.license) > 1:
            *tmp, tail = row.license
            head = ''.join(tmp)
            letter_succession[head].update(tail)

            # if head is longer than 1 (i.e. total license length must be 3),
            # i.e. head has length 2, its first letter can be followed
            # by its second
            if len(head) > 1:
                assert len(row.license) == 3
                assert len(head) == 2
                letter_succession[head[0]].update(head[1])

    letter_succession = {k: sorted(v) for k, v in letter_succession.items()}

    # save to json
    data = {
        'licenseData': license_data,
        'letterSuccession': letter_succession
    }

    fname = './license-plate-data.json'
    with open(fname, 'w') as f:
        json.dump(data, f)


if __name__ == '__main__':
    main()
