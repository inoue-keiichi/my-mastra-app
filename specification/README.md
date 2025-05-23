# My Mastra App - AIエージェント

このプロジェクトは、[Mastra](https://github.com/mastrajs/mastra)フレームワークを使用して構築されたAIエージェントアプリケーションです。

## 技術スタック

- **Mastra**: AIエージェント開発フレームワーク
- **Anthropic Claude**: 高性能な大規模言語モデル
- **TypeScript**: 型安全なコード開発
- **Zod**: スキーマ検証ライブラリ

## プロジェクト構成

```
src/
└── mastra/
    ├── index.ts                # Mastraインスタンスの設定（既存を拡張）
    ├── agents/
    │   ├── index.ts            # 既存の天気エージェント
    │   └── restaurantAgent.ts  # レストラン検索エージェントの定義
    └── tools/
        ├── index.ts            # 既存の天気ツール
        └── restaurantTool.ts   # レストラン検索ツールの実装
```

## エージェント仕様

### 天気エージェント (Weather Agent)

天気エージェントは、ユーザーが指定した場所の現在の天気情報を提供します。

**機能**:

- 場所が指定されていない場合は、ユーザーに場所を尋ねる
- 英語以外の場所名が提供された場合は翻訳
- 複数の部分を持つ場所名（例：「東京都新宿区」）の場合、最も関連性の高い部分（例：「新宿」）を使用
- 湿度、風の状態、降水量などの関連情報を含む
- 簡潔かつ情報量の多いレスポンスを提供

**使用モデル**: Claude 3.5 Sonnet (2024-10-22)

### 天気ツール仕様

天気ツールは、Open-Meteo APIを使用して天気データを取得します。

**入力**:

- `location`: 都市名（文字列）

**出力**:

- `temperature`: 気温（摂氏）
- `feelsLike`: 体感温度（摂氏）
- `humidity`: 湿度（%）
- `windSpeed`: 風速（m/s）
- `windGust`: 突風速度（m/s）
- `conditions`: 天気状態（晴れ、曇り、雨など）
- `location`: 場所名

### 使用例

ユーザーが「東京の天気を教えて」と尋ねると、エージェントは東京の現在の天気情報を取得し、温度、体感温度、湿度、風速、天気状態などの詳細を含む回答を提供します。

### 今後の拡張予定

- 複数日の天気予報の提供
- 気象警報・注意報の通知機能
- 複数の天気データソースのサポート
- 他の言語のサポート強化

---

## レストラン検索AIエージェント

このセクションでは、Mastraフレームワークを使用して実装予定のレストラン検索AIエージェントの仕様を説明します。

## エージェント仕様

### レストラン検索エージェント (Restaurant Agent)

レストラン検索エージェントは、ユーザーが指定した地名を基にレストランを検索し、詳細情報を提供します。

**機能**:

- 地名が指定されていない場合は、ユーザーに地名を尋ねる
- 英語以外の地名が提供された場合は翻訳して検索
- 料理ジャンル、価格帯、評価などの条件でフィルタリング
- レストランの基本情報（名前、住所、評価、価格帯）を提供
- ユーザーの要望に応じて詳細情報（営業時間、メニュー、写真など）を提供
- 複数のレストラン候補から最適なものを推薦
- 簡潔かつ情報量の多いレスポンスを提供

**使用モデル**: Claude 3.5 Sonnet (2024-10-22)

## レストラン検索ツール仕様

レストラン検索ツールは、HotPepper APIを使用してレストラン情報を取得します。
リクエスト URL は `http://webservice.recruit.co.jp/hotpepper/gourmet/v1/` です。
地点を指定して、その範囲にあるお店をオススメ順に取得します。以下はそのクエリの例です。

```
http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=[HOT_PEPPER_API_KEY]&lat=34.67&lng=135.52&range=5&order=4
```

### 検索クエリパラメータ

HotPepper APIでは、以下の主要なパラメータを使用してレストラン検索が可能です：

- `key`: APIキー（必須）
- `lat`: 緯度（位置検索時に必須）
- `lng`: 経度（位置検索時に必須）
- `range`: 検索範囲（1: 300m、2: 500m、3: 1000m（初期値）、4: 2000m、5: 3000m）
- `order`: ソート順（1: 店名かな順、2: ジャンルコード順、3: 小エリアコード順、4: おススメ順（初期値））
- `keyword`: フリーワード検索（店名かな、店名、住所、駅名、お店ジャンルキャッチ、キャッチ）
- `genre`: お店ジャンルコード（複数指定可能）
- `budget`: 検索用ディナー予算コード（複数指定可能）
- `large_area`: 大エリアコード（複数指定可能）
- `middle_area`: 中エリアコード（複数指定可能）
- `small_area`: 小エリアコード（複数指定可能）
- `wifi`: WiFi有無（0: 絞り込まない、1: 絞り込む）
- `private_room`: 個室あり（0: 絞り込まない、1: 絞り込む）
- `card`: カード可（0: 絞り込まない、1: 絞り込む）
- `non_smoking`: 禁煙席（0: 絞り込まない、1: 絞り込む）
- `lunch`: ランチあり（0: 絞り込まない、1: 絞り込む）
- `english`: 英語メニューあり（0: 絞り込まない、1: 絞り込む）
- `child`: お子様連れOK（0: 絞り込まない、1: 絞り込む）
- `count`: 1ページあたりの取得数（初期値：10、最小1、最大100）
- `format`: レスポンス形式（xml または json）

**入力**:

- `location`: 地名（文字列）
- `genre`: 料理ジャンル（オプション）
- `budget`: 予算（オプション）
- `keyword`: キーワード検索（オプション）
- `range`: 検索範囲（オプション）
- `count`: 取得件数（オプション）

**出力**:

- `restaurants`: レストラン情報の配列
  - `id`: お店ID
  - `name`: 掲載店名
  - `name_kana`: 掲載店名かな
  - `address`: 住所
  - `station_name`: 最寄駅名
  - `lat`: 緯度
  - `lng`: 経度
  - `genre`: 料理ジャンル
  - `catch`: お店キャッチ
  - `budget`: ディナー予算
  - `capacity`: 総席数
  - `access`: 交通アクセス
  - `mobile_access`: 携帯用交通アクセス
  - `urls`: 店舗URL
  - `photo`: 写真URL
  - `open`: 営業時間
  - `close`: 定休日
  - `wifi`: WiFi有無
  - `card`: カード可
  - `non_smoking`: 禁煙席
  - `parking`: 駐車場
  - `barrier_free`: バリアフリー
  - `english`: 英語メニュー
  - `child`: お子様連れ
  - `lunch`: ランチ
  - `midnight`: 23時以降も営業
  - `free_drink`: 飲み放題
  - `free_food`: 食べ放題
  - `private_room`: 個室
  - `horigotatsu`: 掘りごたつ
  - `tatami`: 座敷
  - `course`: コース
  - `party_capacity`: 最大宴会収容人数

## 詳細情報取得ツール仕様

特定のレストランの詳細情報を取得するためのツールも実装します。

**入力**:

- `placeId`: HotPepper APIのお店ID

**出力**:

- `shop`: レストラン詳細情報
  - `id`: お店ID
  - `name`: レストラン名
  - `name_kana`: 掲載店名かな
  - `address`: 住所
  - `station_name`: 最寄駅名
  - `catch`: お店キャッチ
  - `genre`: お店ジャンル
  - `budget`: ディナー予算
  - `budget_memo`: 料金備考
  - `capacity`: 総席数
  - `access`: 交通アクセス
  - `urls`: 店舗URL
  - `photo`: 写真URL
  - `open`: 営業時間
  - `close`: 定休日
  - `wifi`: WiFi有無
  - `card`: カード可
  - `non_smoking`: 禁煙席
  - `parking`: 駐車場
  - `barrier_free`: バリアフリー
  - `english`: 英語メニュー
  - `child`: お子様連れ
  - `lunch`: ランチ
  - `midnight`: 23時以降も営業
  - `free_drink`: 飲み放題
  - `free_food`: 食べ放題
  - `private_room`: 個室
  - `horigotatsu`: 掘りごたつ
  - `tatami`: 座敷
  - `course`: コース
  - `party_capacity`: 最大宴会収容人数
  - `other_memo`: その他設備

## 使用例

ユーザーが「渋谷でおすすめの寿司屋を教えて」と尋ねると、エージェントは渋谷エリアの寿司レストランを検索し、評価の高いレストランを3~5個推薦します。各レストランの名前、住所などの基本情報を提供します。

## 今後の拡張予定

- ユーザーの要求に基づいてレストランの詳細情報を返信する
  - memory to agent を有効化する
- 予約機能の統合
- 複数の言語サポート
- ユーザーの好みに基づくパーソナライズされた推薦
- 地図表示機能の追加
- 複数のレストラン情報APIのサポート（Yelp、OpenTable、食べログなど）
- 過去の会話履歴に基づく学習と推薦の改善
- 以下のHotPepper API機能の追加実装:
  - ジャンルマスタAPIを使用した料理ジャンル検索の強化
  - エリアマスタAPI（大・中・小）を使用した地域検索の強化
  - 特集マスタAPIを使用した特集情報の提供
  - 予算マスタAPIを使用した予算範囲検索の強化
  - クレジットカードマスタAPIを使用した支払い方法検索の追加
- 検索条件の複合フィルタリング機能の強化
- レストランの写真表示機能の強化
- 営業時間に基づいた「今開いている」フィルタの実装
- 特定の条件（個室あり、禁煙席あり等）に基づく詳細検索機能
