# データベース設計

## reservations

予約情報を保存するテーブル

| カラム名 | 型 | 説明 |
|----------|----|------|
| id | UUID | 予約ID |
| name | text | 予約者名 |
| phone | text | 電話番号 |
| date | date | 来店日 |
| time | time | 来店時間 |
| people | integer | 人数 |
| memo | text | メモ |

## seats

店舗の席情報

| カラム名 | 型 |
|----------|----|
| id | integer |
| name | text |

データ

- 1
- 2
- 3
- 5
- 6
- counter1
- counter2
- counter3