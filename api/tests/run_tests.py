#!/usr/bin/env python3
"""
テストを実行するためのスクリプト
"""
import unittest
import sys
import os

# テストディレクトリをPythonパスに追加
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# テストを検出して実行
if __name__ == '__main__':
    # テストディレクトリからすべてのテストを検出
    test_suite = unittest.defaultTestLoader.discover('tests')
    
    # テストを実行
    test_runner = unittest.TextTestRunner(verbosity=2)
    result = test_runner.run(test_suite)
    
    # 終了コードを設定（テストが失敗した場合は1、成功した場合は0）
    sys.exit(not result.wasSuccessful())
