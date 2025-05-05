import unittest
from unittest.mock import patch, MagicMock
import json
import sqlite3
from bookmarks_categorize.modules.crud import (
    get_or_create_category,
    insert_bookmark,
    get_bookmarks_by_category,
    get_all_categories
)

class TestCrudFunctions(unittest.TestCase):
    """CRUDモジュールの関数のテスト"""

    def setUp(self):
        """各テスト前の準備"""
        # テスト用のデータ
        self.test_category_name = "テクノロジー"
        self.test_bookmark_id = "bookmark_123"
        self.test_category_id = 1
        self.test_tweet = {
            "tweet_id": "1234567890",
            "text": "これはテスト用のツイートです",
            "user": {
                "screen_name": "test_user",
                "name": "Test User"
            }
        }

    @patch('bookmarks_categorize.modules.crud.get_connection')
    def test_get_or_create_category_existing(self, mock_get_connection):
        """既存のカテゴリを取得するテスト"""
        # モックの設定
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_connection.return_value.__enter__.return_value = mock_conn
        
        # カテゴリが存在する場合のモック設定
        mock_cursor.fetchone.return_value = (self.test_category_id,)
        
        # 関数実行
        result = get_or_create_category(self.test_category_name)
        
        # アサーション
        self.assertEqual(result, self.test_category_id)
        mock_cursor.execute.assert_called_once_with(
            "SELECT id FROM bookmarks_category WHERE categorize_name = ?", 
            (self.test_category_name,)
        )
        # insertは呼ばれないはず
        mock_cursor.execute.assert_called_once()

    @patch('bookmarks_categorize.modules.crud.get_connection')
    def test_get_or_create_category_new(self, mock_get_connection):
        """新しいカテゴリを作成するテスト"""
        # モックの設定
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_connection.return_value.__enter__.return_value = mock_conn
        
        # カテゴリが存在しない場合のモック設定
        mock_cursor.fetchone.return_value = None
        mock_cursor.lastrowid = self.test_category_id
        
        # 関数実行
        result = get_or_create_category(self.test_category_name)
        
        # アサーション
        self.assertEqual(result, self.test_category_id)
        self.assertEqual(mock_cursor.execute.call_count, 2)  # SELECT と INSERT の2回
        mock_cursor.execute.assert_any_call(
            "SELECT id FROM bookmarks_category WHERE categorize_name = ?", 
            (self.test_category_name,)
        )
        mock_cursor.execute.assert_any_call(
            "INSERT INTO bookmarks_category (categorize_name) VALUES (?)", 
            (self.test_category_name,)
        )
        mock_conn.commit.assert_called_once()

    @patch('bookmarks_categorize.modules.crud.get_connection')
    def test_insert_bookmark(self, mock_get_connection):
        """ブックマークを挿入するテスト"""
        # モックの設定
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_connection.return_value.__enter__.return_value = mock_conn
        
        # 関数実行
        insert_bookmark(self.test_bookmark_id, self.test_category_id, self.test_tweet)
        
        # アサーション
        mock_cursor.execute.assert_called_once_with(
            "INSERT OR IGNORE INTO bookmarks (id, categorize_id, tweet) VALUES (?, ?, ?)",
            (self.test_bookmark_id, self.test_category_id, json.dumps(self.test_tweet, ensure_ascii=False))
        )
        mock_conn.commit.assert_called_once()

    @patch('bookmarks_categorize.modules.crud.get_connection')
    def test_get_bookmarks_by_category_with_id(self, mock_get_connection):
        """特定のカテゴリのブックマークを取得するテスト"""
        # モックの設定
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_connection.return_value.__enter__.return_value = mock_conn
        
        # カーソルの戻り値を設定
        mock_cursor.fetchall.return_value = [
            (self.test_bookmark_id, self.test_category_name, json.dumps(self.test_tweet), "2023-01-01 12:00:00")
        ]
        
        # 関数実行
        result = get_bookmarks_by_category(self.test_category_id)
        
        # アサーション
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], self.test_bookmark_id)
        self.assertEqual(result[0]["category"], self.test_category_name)
        self.assertEqual(result[0]["tweet"], self.test_tweet)
        self.assertEqual(result[0]["created_at"], "2023-01-01 12:00:00")
        
        mock_cursor.execute.assert_called_once()
        # WHERE句にカテゴリIDが含まれていることを確認
        args, kwargs = mock_cursor.execute.call_args
        self.assertIn("WHERE b.categorize_id = ?", args[0])
        self.assertEqual(args[1], (self.test_category_id,))

    @patch('bookmarks_categorize.modules.crud.get_connection')
    def test_get_bookmarks_by_category_all(self, mock_get_connection):
        """全てのブックマークを取得するテスト"""
        # モックの設定
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_connection.return_value.__enter__.return_value = mock_conn
        
        # カーソルの戻り値を設定
        mock_cursor.fetchall.return_value = [
            (self.test_bookmark_id, self.test_category_name, json.dumps(self.test_tweet), "2023-01-01 12:00:00")
        ]
        
        # 関数実行
        result = get_bookmarks_by_category(None)
        
        # アサーション
        self.assertEqual(len(result), 1)
        mock_cursor.execute.assert_called_once()
        # WHERE句にカテゴリIDが含まれていないことを確認
        args, kwargs = mock_cursor.execute.call_args
        self.assertNotIn("WHERE b.categorize_id = ?", args[0])
        self.assertIn("WHERE b.is_deleted = 0", args[0])

    @patch('bookmarks_categorize.modules.crud.get_connection')
    def test_get_all_categories(self, mock_get_connection):
        """全てのカテゴリを取得するテスト"""
        # モックの設定
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_connection.return_value.__enter__.return_value = mock_conn
        
        # カーソルの戻り値を設定
        mock_cursor.fetchall.return_value = [
            (self.test_category_id, self.test_category_name, "2023-01-01 12:00:00")
        ]
        
        # 関数実行
        result = get_all_categories()
        
        # アサーション
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], self.test_category_id)
        self.assertEqual(result[0]["name"], self.test_category_name)
        self.assertEqual(result[0]["created_at"], "2023-01-01 12:00:00")
        
        mock_cursor.execute.assert_called_once()


if __name__ == '__main__':
    unittest.main()
