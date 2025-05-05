import unittest
from unittest.mock import patch, MagicMock
import json
import io
from fastapi.testclient import TestClient
from fastapi import FastAPI
from bookmarks_categorize.routers.bookmark import router
from bookmarks_categorize.modules.dify import DifyModule

# テスト用のFastAPIアプリを作成
app = FastAPI()
app.include_router(router, prefix="/bookmarks")
client = TestClient(app)

class TestBookmarkRouter(unittest.TestCase):
    """ブックマークルーターのテスト"""

    def setUp(self):
        """各テスト前の準備"""
        # テスト用のデータ
        self.test_category = {
            "id": 1,
            "name": "テクノロジー",
            "created_at": "2023-01-01 12:00:00"
        }
        self.test_bookmark = {
            "id": "bookmark_123",
            "category": "テクノロジー",
            "tweet": {
                "tweet_id": "1234567890",
                "text": "これはテスト用のツイートです",
                "user": {
                    "screen_name": "test_user",
                    "name": "Test User"
                }
            },
            "created_at": "2023-01-01 12:00:00"
        }

    @patch('bookmarks_categorize.routers.bookmark.get_all_categories')
    def test_get_categories(self, mock_get_all_categories):
        """カテゴリ取得エンドポイントのテスト"""
        # モックの設定
        mock_get_all_categories.return_value = [self.test_category]
        
        # リクエスト実行
        response = client.get("/bookmarks/categories")
        
        # アサーション
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"categories": [self.test_category]})
        mock_get_all_categories.assert_called_once()

    @patch('bookmarks_categorize.routers.bookmark.get_bookmarks_by_category')
    def test_get_bookmarks_all(self, mock_get_bookmarks_by_category):
        """全ブックマーク取得エンドポイントのテスト"""
        # モックの設定
        mock_get_bookmarks_by_category.return_value = [self.test_bookmark]
        
        # リクエスト実行
        response = client.get("/bookmarks/")
        
        # アサーション
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"bookmarks": [self.test_bookmark]})
        mock_get_bookmarks_by_category.assert_called_once_with(None)

    @patch('bookmarks_categorize.routers.bookmark.get_bookmarks_by_category')
    def test_get_bookmarks_by_category(self, mock_get_bookmarks_by_category):
        """カテゴリ別ブックマーク取得エンドポイントのテスト"""
        # モックの設定
        mock_get_bookmarks_by_category.return_value = [self.test_bookmark]
        
        # リクエスト実行
        response = client.get("/bookmarks/?category_id=1")
        
        # アサーション
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"bookmarks": [self.test_bookmark]})
        mock_get_bookmarks_by_category.assert_called_once_with(1)

    @patch('bookmarks_categorize.routers.bookmark.get_or_create_category')
    @patch('bookmarks_categorize.routers.bookmark.get_all_categories')
    def test_create_category(self, mock_get_all_categories, mock_get_or_create_category):
        """カテゴリ作成エンドポイントのテスト"""
        # モックの設定
        mock_get_or_create_category.return_value = 1
        mock_get_all_categories.return_value = [self.test_category]
        
        # リクエスト実行
        response = client.post(
            "/bookmarks/categories",
            json={"name": "テクノロジー"}
        )
        
        # アサーション
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"category": self.test_category})
        mock_get_or_create_category.assert_called_once_with("テクノロジー")
        mock_get_all_categories.assert_called_once()

    @patch('bookmarks_categorize.routers.bookmark.DifyModule')
    @patch('bookmarks_categorize.routers.bookmark.get_or_create_category')
    @patch('bookmarks_categorize.routers.bookmark.insert_bookmark')
    def test_categorize_bookmarks(self, mock_insert_bookmark, mock_get_or_create_category, mock_dify_module):
        """ブックマークカテゴリ化エンドポイントのテスト"""
        # モックの設定
        mock_dify_instance = MagicMock()
        mock_dify_module.return_value = mock_dify_instance
        
        mock_dify_instance.categorized_json.return_value = {
            "data": {
                "outputs": {
                    "categorized_bookmark_json": '{"分類項目": "テクノロジー"}'
                }
            }
        }
        
        mock_get_or_create_category.return_value = 1
        
        # テスト用のJSONファイル
        test_json = json.dumps([{
            "tweet_id": "1234567890",
            "text": "これはテスト用のツイートです",
            "user": {
                "screen_name": "test_user",
                "name": "Test User"
            }
        }])
        
        # ファイルをアップロード
        response = client.post(
            "/bookmarks/categorize",
            files={"file": ("test.json", io.BytesIO(test_json.encode()), "application/json")}
        )
        
        # アサーション
        self.assertEqual(response.status_code, 200)
        # mock_dify_instance.categorized_json.assert_called_once()
        # mock_get_or_create_category.assert_called_once_with("テクノロジー")
        # mock_insert_bookmark.assert_called_once()

    @patch('bookmarks_categorize.routers.bookmark.get_bookmarks_by_category')
    def test_get_bookmarks_error(self, mock_get_bookmarks_by_category):
        """ブックマーク取得エラーのテスト"""
        # 例外を発生させる
        mock_get_bookmarks_by_category.side_effect = Exception("テスト用のエラー")
        
        # リクエスト実行
        response = client.get("/bookmarks/")
        
        # アサーション
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.json(), {"detail": "ブックマーク取得エラー: テスト用のエラー"})

    @patch('bookmarks_categorize.routers.bookmark.get_all_categories')
    def test_get_categories_error(self, mock_get_all_categories):
        """カテゴリ取得エラーのテスト"""
        # 例外を発生させる
        mock_get_all_categories.side_effect = Exception("テスト用のエラー")
        
        # リクエスト実行
        response = client.get("/bookmarks/categories")
        
        # アサーション
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.json(), {"detail": "カテゴリ取得エラー: テスト用のエラー"})

    @patch('bookmarks_categorize.routers.bookmark.get_or_create_category')
    def test_create_category_error(self, mock_get_or_create_category):
        """カテゴリ作成エラーのテスト"""
        # 例外を発生させる
        mock_get_or_create_category.side_effect = Exception("テスト用のエラー")
        
        # リクエスト実行
        response = client.post(
            "/bookmarks/categories",
            json={"name": "テクノロジー"}
        )
        
        # アサーション
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.json(), {"detail": "カテゴリ作成エラー: テスト用のエラー"})


if __name__ == '__main__':
    unittest.main()
