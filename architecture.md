# ポモドーロタイマーWebアプリ アーキテクチャ案

## 1. 技術スタック
- バックエンド: Flask (Python)
- フロントエンド: HTML, CSS, JavaScript
- 静的ファイル: Flaskのstaticディレクトリ
- テンプレート: Flaskのtemplatesディレクトリ

## 2. ディレクトリ構成例
```
project_root/
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── timer.js
├── templates/
│   └── index.html
├── app.py
├── requirements.txt
└── architecture.md
```

## 3. 機能分担
### バックエンド（Flask）
- ルーティング（`/` でindex.htmlを返す）
- 必要に応じてAPIエンドポイント（例: `/api/settings`, `/api/history`）
- 設定や履歴の保存・取得（ファイルやDB利用も可）
- テスト容易性のため、ロジックは関数・クラスに分離
- 依存性注入（DI）で外部依存（DB、設定、時刻取得など）を切り替え可能に
- Flaskアプリはファクトリパターンで生成

### フロントエンド（HTML/CSS/JavaScript）
- UIモックに基づいたレイアウト（index.html）
- タイマー表示・操作（timer.js）
- タイマーのカウントダウン・状態遷移はJavaScriptで管理
- 必要に応じてAPIと通信（fetch/Ajax）
- CSSでUIデザイン・レスポンシブ対応

## 4. テスト容易性の工夫
- バックエンドのロジックはクラス・関数単位で分離し、個別にユニットテスト可能
- FlaskのAPIはBlueprintで分割し、`test_client()`でAPIテスト
- 依存性注入でDBや設定・時刻取得をモック化可能
- テスト用設定・インメモリDB利用で本番データと分離
- フロントエンドも関数分割し、Jest等で単体テスト可能

## 5. 拡張性・保守性
- 履歴やユーザー管理などの拡張も容易
- 設定値や履歴保存先は設定ファイルや環境変数で切り替え可能
- ロガーや設定ファイル名も注入可能

## 6. サンプルルーティング
```python
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/settings', methods=['GET', 'POST'])
def settings():
    # 設定の取得・保存
    pass

@app.route('/api/history', methods=['GET'])
def history():
    # 履歴の取得
    pass
```

## 7. 補足
- タイマー本体はJavaScriptで管理し、サーバー側は設定・履歴・API提供に特化
- シンプルな場合はAPI不要、拡張性を考えるならAPI設計も検討
- テスト容易性・拡張性・保守性を重視した設計
