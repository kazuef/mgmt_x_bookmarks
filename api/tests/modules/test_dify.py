import unittest
from unittest.mock import patch, MagicMock
import json
from bookmarks_categorize.modules.dify import DifyModule
from bookmarks_categorize.config import Settings

class TestDifyModule(unittest.TestCase):
    """DifyModuleクラスのテスト"""

    def setUp(self):
        """各テスト前の準備"""
        # self.dify_module = DifyModule()
        settings = Settings()
        self.dify_module = DifyModule(
            dify_api_key_categorize_json = settings.dify_api_key_categorize_json,
            dify_api_key_csv_to_json = settings.dify_api_key_csv_to_json,
            dify_base_url = settings.dify_base_url,
            dify_user = settings.dify_user
        )
        self.test_bookmark_json = json.dumps({
            "tweet_id": "1234567890",
            "text": "これはテスト用のツイートです",
            "user": {
                "screen_name": "test_user",
                "name": "Test User"
            }
        })

    @patch('bookmarks_categorize.modules.dify.requests.post')
    def test_categorized_json_success(self, mock_post):
        """categorized_jsonメソッドが成功した場合のテスト"""
        # モックレスポンスの設定
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "data": {
                "outputs": {
                    "categorized_bookmark_json": '{"分類項目": "テクノロジー"}'
                }
            }
        }
        mock_post.return_value = mock_response

        # メソッド実行
        result = self.dify_module.categorized_json(self.test_bookmark_json)

        # アサーション
        self.assertIsNotNone(result)
        self.assertEqual(result["data"]["outputs"]["categorized_bookmark_json"], '{"分類項目": "テクノロジー"}')
        
        # 正しいURLとヘッダーでリクエストが行われたことを確認
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        self.assertEqual(args[0], f"{self.dify_module.dify_base_url}/workflows/run")
        self.assertIn("Authorization", kwargs["headers"])
        self.assertIn("Content-Type", kwargs["headers"])
        self.assertEqual(kwargs["headers"]["Content-Type"], "application/json")

    @patch('bookmarks_categorize.modules.dify.requests.post')
    def test_categorized_json_failure(self, mock_post):
        """categorized_jsonメソッドが失敗した場合のテスト"""
        # 例外を発生させるようにモックを設定
        mock_post.side_effect = Exception("API接続エラー")

        # # メソッド実行
        # with patch('bookmarks_categorize.modules.dify.st.error') as mock_error:
        #     result = self.dify_module.categorized_json(self.test_bookmark_json)

        # アサーション
        # self.assertIsNone(result)
        self.assertRaises(Exception, self.dify_module.categorized_json, self.test_bookmark_json)
        # mock_error.assert_called_once_with("ワークフロー実行エラー: API接続エラー")

    @patch('bookmarks_categorize.modules.dify.requests.post')
    def test_upload_file(self, mock_post):
        """upload_fileメソッドのテスト"""
        # モックファイルの作成
        mock_file = MagicMock()
        mock_file.name = "test.csv"
        mock_file.read.return_value = b"test,data"
        mock_file.type = "text/csv"

        # モックレスポンスの設定
        mock_response = MagicMock()
        mock_response.status_code = 201
        mock_response.json.return_value = {"id": "file_123"}
        mock_post.return_value = mock_response

        # メソッド実行
        result = self.dify_module.upload_file(mock_file)

        # アサーション
        self.assertEqual(result, {"id": "file_123"})
        mock_post.assert_called_once()

    @patch('bookmarks_categorize.modules.dify.requests.post')
    def test_convert_csv_to_json(self, mock_post):
        """convert_csv_to_jsonメソッドのテスト"""
        # モックレスポンスの設定
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "data": {
                "outputs": {
                    "bookmarks_json": [{"tweet_id": "123", "text": "テスト"}]
                }
            }
        }
        mock_post.return_value = mock_response

        # メソッド実行
        result = self.dify_module.convert_csv_to_json("file_123")

        # アサーション
        self.assertEqual(result["data"]["outputs"]["bookmarks_json"], [{"tweet_id": "123", "text": "テスト"}])
        mock_post.assert_called_once()


if __name__ == '__main__':
    unittest.main()
