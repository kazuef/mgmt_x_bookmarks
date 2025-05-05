# ブックマークカテゴリ化 API のテスト

このディレクトリには、`api/bookmarks_categorize`モジュールのテストが含まれています。

## テストの構造

テストは以下のように構成されています：

- `modules/`: モジュールのテスト
  - `test_bookmark.py`: `DifyModule`クラスのテスト
  - `test_crud.py`: データベース操作関数のテスト
  - `test_database.py`: データベース接続関数のテスト
- `routers/`: ルーターのテスト
  - `test_bookmark.py`: ブックマークルーターのテスト

## テストの実行方法

### 依存関係のインストール

テストを実行するには、以下の依存関係をインストールする必要があります：

```bash
cd api
poetry add --dev pytest pytest-cov httpx
```

または、Poetry を使用していない場合は：

```bash
pip install pytest pytest-cov httpx
```

### テストの実行

すべてのテストを実行するには：

```bash
cd api
python -m pytest tests/
```

特定のテストファイルを実行するには：

```bash
cd api
python -m pytest tests/modules/test_dify.py
```

カバレッジレポートを生成するには：

```bash
cd api
python -m pytest --cov=bookmarks_categorize tests/
```

### テストスクリプトを使用する

このディレクトリには、テストを実行するためのスクリプト`run_tests.py`も含まれています。このスクリプトを使用するには：

```bash
cd api
python tests/run_tests.py
```

## テストの作成方法

新しいテストを作成する場合は、以下のガイドラインに従ってください：

1. 適切なディレクトリ（`modules/`または`routers/`）にテストファイルを作成します。
2. テストファイル名は`test_`で始める必要があります。
3. テストクラスは`unittest.TestCase`を継承する必要があります。
4. テストメソッド名は`test_`で始める必要があります。
5. 外部依存関係（データベース、API）はモックを使用してテストします。

## モックの使用方法

テストでは、`unittest.mock`モジュールを使用して外部依存関係をモックしています。例えば：

```python
@patch('api.bookmarks_categorize.modules.dify.requests.post')
def test_categorized_json_success(self, mock_post):
    # モックの設定
    mock_response = MagicMock()
    mock_response.json.return_value = {"data": {"outputs": {"categorized_bookmark_json": '{"分類項目": "テクノロジー"}'}}}
    mock_post.return_value = mock_response

    # テスト対象の関数を実行
    result = self.dify_module.categorized_json(self.test_bookmark_json)

    # アサーション
    self.assertEqual(result["data"]["outputs"]["categorized_bookmark_json"], '{"分類項目": "テクノロジー"}')
```

## FastAPI エンドポイントのテスト

FastAPI エンドポイントのテストでは、`TestClient`を使用しています：

```python
from fastapi.testclient import TestClient
from fastapi import FastAPI
from api.bookmarks_categorize.routers.bookmark import router

app = FastAPI()
app.include_router(router, prefix="/bookmarks")
client = TestClient(app)

# テスト
response = client.get("/bookmarks/categories")
self.assertEqual(response.status_code, 200)
```
