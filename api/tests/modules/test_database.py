import unittest
from unittest.mock import patch, MagicMock, mock_open
import os
import sqlite3
from bookmarks_categorize.modules.database import get_connection, init_db, db_path

class TestDatabaseFunctions(unittest.TestCase):
    """データベースモジュールの関数のテスト"""

    @patch('bookmarks_categorize.modules.database.sqlite3.connect')
    def test_get_connection(self, mock_connect):
        """get_connectionコンテキストマネージャーのテスト"""
        # モックの設定
        mock_conn = MagicMock()
        mock_connect.return_value = mock_conn
        
        # コンテキストマネージャーの使用
        with get_connection() as conn:
            # 接続が返されることを確認
            self.assertEqual(conn, mock_conn)
            # 正しいパスで接続が行われたことを確認
            mock_connect.assert_called_once_with(db_path)
        
        # コンテキストマネージャーを抜けた後に接続がクローズされることを確認
        mock_conn.close.assert_called_once()

    @patch('bookmarks_categorize.modules.database.os.makedirs')
    @patch('bookmarks_categorize.modules.database.sqlite3.connect')
    @patch('bookmarks_categorize.modules.database.os.path.dirname')
    def test_init_db(self, mock_dirname, mock_connect, mock_makedirs):
        """init_db関数のテスト"""
        # モックの設定
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_connect.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cursor
        mock_dirname.return_value = "/mock/path"
        
        # 関数実行
        init_db()
        
        # ディレクトリが作成されることを確認
        mock_makedirs.assert_called_once_with("/mock/path", exist_ok=True)
        
        # 接続が行われることを確認
        mock_connect.assert_called_once_with(db_path)
        
        # カーソルが取得されることを確認
        mock_conn.cursor.assert_called_once()
        
        # テーブル作成のSQLが実行されることを確認
        self.assertEqual(mock_cursor.execute.call_count, 2)  # 2つのテーブル作成
        
        # コミットが行われることを確認
        mock_conn.commit.assert_called_once()
        
        # 接続がクローズされることを確認
        mock_conn.close.assert_called_once()

    @patch('bookmarks_categorize.modules.database.sqlite3.connect')
    def test_get_connection_exception(self, mock_connect):
        """get_connectionコンテキストマネージャーの例外処理のテスト"""
        # モックの設定
        mock_conn = MagicMock()
        mock_connect.return_value = mock_conn
        
        # 例外を発生させる
        mock_conn.cursor.side_effect = sqlite3.Error("テスト用のエラー")
        
        # コンテキストマネージャーの使用（例外が発生する）
        try:
            with get_connection() as conn:
                conn.cursor()  # 例外が発生する
            self.fail("例外が発生しませんでした")
        except sqlite3.Error:
            pass  # 期待通りの例外
        
        # 例外が発生しても接続がクローズされることを確認
        mock_conn.close.assert_called_once()


if __name__ == '__main__':
    unittest.main()
