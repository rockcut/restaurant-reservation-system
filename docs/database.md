# データベース設計

## 1. 概要

本システムではSupabase PostgreSQLを使用して予約情報を管理する。

現在の主要テーブルは以下の3つである。

```text
reservations
reservation_seats
profiles
```

それぞれの役割を分離し、

- 予約そのものの情報
- 実際に使用する物理的な席
- スタッフの権限

を個別に管理する。

---

# 2. テーブル構成

```text
auth.users
    │
    │ 1 : 1
    ▼
 profiles


reservations
    │
    │ 1 : N
    ▼
reservation_seats
```

---

# 3. reservations

予約そのものの情報を保存するテーブル。

## 主なカラム

| カラム名 | 型の概要 | 説明 |
|---|---|---|
| id | number | 予約ID |
| reservation_date | date | 来店日 |
| time | time / text | 来店時間 |
| name | text | 予約者名 |
| people | integer | 人数 |
| seat | integer | 代表席（旧仕様互換用） |
| course | text / null | コース |
| allergy | text / null | アレルギー情報 |
| plate | text / null | お祝いプレート希望 |
| plate_message | text / null | プレートメッセージ |
| phone | text / null | 電話番号 |
| note | text / null | 備考 |

---

## seatカラムについて

`reservations.seat` は、初期実装で1予約につき1席を管理していた時のカラムである。

その後、複数テーブルを使用する予約へ対応するため、

```text
reservation_seats
```

を追加した。

そのため、現在の実際の席割り当てについては、

**`reservation_seats` を正とする。**

例えば、

```text
予約ID: 100
使用席: 2 + 3
```

の場合、

`reservations.seat` に代表席として `2` が残っている場合でも、

```text
reservation_seats

reservation_id | seat
---------------|-----
100            | 2
100            | 3
```

を実際の席割り当てとして使用する。

席交換後などに `reservations.seat` と実際の席が一致しない場合があるため、アプリケーションでは `reservation_seats` を優先する。

---

# 4. reservation_seats

予約と物理的な席の対応を管理するテーブル。

1つの予約に複数のレコードを登録することで、連結席予約を表現する。

## 主なカラム

| カラム名 | 説明 |
|---|---|
| reservation_id | `reservations.id` に対応する予約ID |
| seat | 席番号 |

---

## 例：単一席

テーブル5を使用する予約。

```text
reservation_id | seat
---------------|-----
100            | 5
```

---

## 例：2席連結

テーブル2・3を使用する予約。

```text
reservation_id | seat
---------------|-----
101            | 2
101            | 3
```

---

## 例：3席連結

テーブル1・2・3を使用する予約。

```text
reservation_id | seat
---------------|-----
102            | 1
102            | 2
102            | 3
```

---

# 5. 席番号

物理的な席は以下の番号で管理する。

## テーブル

```text
1
2
3
5
6
```

テーブル4は存在しない。

## カウンター

```text
101
102
103
```

UI上では、

```text
101 → C1
102 → C2
103 → C3
```

として表示する。

---

# 6. 許可される席構成

現在、予約可能な席構成は以下とする。

```text
[1]
[2]
[3]
[5]
[6]

[1, 2]
[2, 3]
[1, 2, 3]
[5, 6]

[101]
[102]
[103]
```

上記以外の組み合わせは予約不可とする。

この判定は主にフロントエンド側で行う。

---

# 7. profiles

Supabase Authenticationのユーザーに、アプリケーション上の権限を設定するためのテーブル。

## テーブル定義

```sql
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('editor', 'viewer'))
);
```

Row Level Securityを有効にする。

```sql
alter table public.profiles enable row level security;
```

---

## カラム

| カラム名 | 型 | 説明 |
|---|---|---|
| user_id | uuid | Supabase AuthのユーザーID |
| role | text | editor または viewer |

---

# 8. ユーザーロール

以下の2種類を使用する。

```text
editor
viewer
```

## editor

予約データを変更できる。

```text
SELECT
INSERT
UPDATE
DELETE
```

および席交換を利用できる。

## viewer

予約情報の閲覧のみ可能。

```text
SELECT
```

予約の追加・編集・削除・席交換は許可しない。

---

# 9. profiles のRLS

ログインしているユーザーは、自分自身のprofileのみ取得できる。

```sql
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);
```

フロントエンドはログイン後、

```text
auth.users.id
        ↓
profiles.user_id
        ↓
profiles.role
```

からユーザーの権限を取得する。

role取得に失敗した場合は、安全側に倒すためViewerとして扱う。

---

# 10. reservations のRLS

## SELECT

認証済みユーザーは予約情報を閲覧できる。

```text
authenticated
→ SELECT可能
```

Editor / Viewerの両方が対象。

---

## INSERT

Editorのみ予約を追加できる。

判定には `profiles.role` を使用する。

概念的には以下の条件となる。

```sql
exists (
  select 1
  from public.profiles
  where profiles.user_id = auth.uid()
    and profiles.role = 'editor'
)
```

---

## UPDATE

Editorのみ予約を変更できる。

```text
editor → UPDATE可能
viewer → UPDATE不可
```

---

## DELETE

Editorのみ予約を削除できる。

```text
editor → DELETE可能
viewer → DELETE不可
```

---

# 11. reservation_seats のRLS

## SELECT

認証済みユーザーは席割り当てを閲覧できる。

```text
editor → SELECT可能
viewer → SELECT可能
```

---

## INSERT

Editorのみ可能。

---

## UPDATE

Editorのみ可能。

---

## DELETE

現在のRLS設計では、`reservation_seats` に対する一般的なDELETE policyは設定していない。

既存の処理やSupabase側の実装を変更する場合は、この点を確認すること。

---

# 12. フロントエンドとRLSの関係

権限制御は、

```text
フロントエンド
+
Supabase RLS
```

の両方で実施する。

例えばViewerではフロントエンド上から、

```text
予約追加
予約編集
予約削除
席交換
```

のUIを表示しない。

ただし、UIを非表示にするだけではセキュリティ対策として不十分であるため、Supabase RLSでもデータ更新を拒否する。

```text
Viewer
   │
   ├─ フロント → 編集UIを表示しない
   │
   └─ Supabase → UPDATE等をRLSで拒否
```

---

# 13. 席交換RPC

席交換処理ではSupabase RPCを使用する。

現在使用しているRPCは以下。

```text
swap_reservation_seats
swap_reservation_seat_blocks
```

---

## swap_reservation_seats

1席単位の席交換を行う。

例：

```text
交換前

予約A → 1
予約B → 5

        ↓

交換後

予約A → 5
予約B → 1
```

---

## swap_reservation_seat_blocks

2席ブロック単位の交換を行う。

対象ブロック：

```text
[1, 2]
[2, 3]
[5, 6]
```

例：

```text
予約A → [1, 2]
予約B → [5, 6]

        ↓

予約A → [5, 6]
予約B → [1, 2]
```

重複する席を持つブロック同士は交換対象にしない。

---

# 14. RPCのセキュリティ

以下のRPCは、

```text
swap_reservation_seats
swap_reservation_seat_blocks
```

ともに、

```text
security_definer = false
```

となっている。

つまり、

```text
SECURITY INVOKER
```

として実行される。

そのため、RPCを呼び出したユーザー自身の権限およびRLSが適用される。

ViewerがRPCを直接呼び出した場合でも、Editor用の更新権限を持たないため、データベース側で変更を防止できる構成とする。

---

# 15. 席交換後のデータ

席交換では、実際の物理席割り当てである

```text
reservation_seats
```

を更新する。

`reservations.seat` は旧仕様の代表席カラムであるため、席交換後に実際の席と一致しない場合がある。

したがって、

```text
reservation.seats
```

が取得できる場合は必ずそちらを優先する。

フロントエンドでは概念的に、

```ts
reservation.seats && reservation.seats.length > 0
  ? reservation.seats
  : [reservation.seat]
```

のように扱う。

---

# 16. 予約取得

予約情報を取得する際は、

```text
reservations
+
reservation_seats
```

を合わせて取得する。

フロントエンド上では、

```ts
type Reservation = {
  id: number;
  seat: number;
  seats?: number[];
  name: string;
  people: number;
  time: string;
  course: string | null;
  allergy: string | null;
  plate: string | null;
  plate_message: string | null;
  phone: string | null;
  note: string | null;
};
```

のような形式で扱う。

---

# 17. 認証

認証にはSupabase Authenticationを使用する。

スタッフごとに個別のAuthユーザーを作成する。

```text
auth.users
```

と、

```text
public.profiles
```

を `user_id` で紐づける。

```text
auth.users.id
      │
      │
      ▼
profiles.user_id
```

パスワード自体はアプリケーションのテーブルでは保存せず、Supabase Authenticationに管理を任せる。

---

# 18. 個人情報

`reservations` には以下の個人情報が含まれる可能性がある。

```text
予約者名
電話番号
アレルギー情報
備考
```

そのため、未認証ユーザーから予約情報へアクセスできないようにする。

また、GitHubなどの公開リポジトリへ実際の予約データを登録しない。

---

# 19. 初期設計からの変更

初期設計では、

```text
reservations
seats
```

の2テーブルを中心とした構成を想定していた。

しかし、実際の店舗要件を確認する中で、

```text
1件の予約が複数の席を使用する
```

という要件が明確になった。

そのため、単一の `seat` カラムだけでは管理できなくなり、

```text
reservation_seats
```

を追加した。

さらに、スタッフごとの編集権限を管理するため、

```text
profiles
```

を追加した。

現在の主要構成は、

```text
reservations
        │
        ▼
reservation_seats

auth.users
        │
        ▼
profiles
```

となっている。

---

# 20. 設計上の重要事項

今後このデータベースを変更する場合、以下を特に注意する。

### 1. reservation_seatsを物理席の正とする

```text
reservations.seat
```

だけを使用する実装へ戻さない。

複数席予約や席交換が正しく動作しなくなる可能性がある。

---

### 2. Viewerの制限をフロントだけに依存しない

Editor / Viewerの権限制御は必ずRLSでも維持する。

---

### 3. 席交換RPCの権限を確認する

RPCを変更する場合、

```text
SECURITY INVOKER
```

とRLSの関係を確認する。

不用意に `SECURITY DEFINER` へ変更すると、Viewerが本来許可されていない更新を実行できる可能性がある。

---

### 4. 実データをGitHubへ保存しない

開発資料やSQLには、

- 実際の予約者名
- 電話番号
- 実際のスタッフ認証情報
- パスワード

を含めない。