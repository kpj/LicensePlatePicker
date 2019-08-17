import json

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
    data = {}
    for row in df.itertuples():
        data[row.license] = {
            'city': row.city,
            'county': row.county,
            'source': row.source
        }

    fname = './license-plate-data.json'
    with open(fname, 'w') as f:
        json.dump(data, f)


if __name__ == '__main__':
    main()
