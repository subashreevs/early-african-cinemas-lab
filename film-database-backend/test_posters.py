import io
import os
import re
import tempfile
import unittest
from unittest.mock import patch

from PIL import Image

os.environ.setdefault('DATABASE_URL', 'postgresql://unused/unused')
os.environ.setdefault('JWT_SECRET_KEY', 'test-only-secret')

from app import app, delete_film_poster, get_film_poster, upload_film_poster


class FakeCursor:
    def __init__(self, state):
        self.state = state
        self.result = None

    def execute(self, query, params):
        if query.startswith('SELECT poster_filename'):
            self.result = {'poster_filename': self.state['filename']}
        elif query.startswith('SELECT poster_url'):
            self.result = {'poster_url': self.state['url']}
        elif query.startswith('UPDATE films SET poster_url = NULL'):
            self.state.update(url=None, filename=None)
        elif query.startswith('UPDATE films SET poster_url = %s'):
            self.state.update(url=params[0], filename=params[1])
        else:
            raise AssertionError(query)

    def fetchone(self):
        return self.result

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        pass


class FakeConnection:
    def __init__(self):
        self.state = {'url': None, 'filename': None}
        self.commits = 0

    def cursor(self):
        return FakeCursor(self.state)

    def commit(self):
        self.commits += 1

    def rollback(self):
        pass


def image_file(color):
    data = io.BytesIO()
    Image.new('RGBA', (1600, 2400), color).save(data, format='PNG')
    data.seek(0)
    return data


class PosterRoutesTest(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.connection = FakeConnection()
        self.upload_dir = patch.dict(os.environ, {'POSTER_UPLOAD_FOLDER': self.folder.name})
        self.db = patch('app.get_db_connection', return_value=self.connection)
        self.role = patch('app.has_role', return_value=True)
        for context in (self.upload_dir, self.db, self.role):
            context.start()
            self.addCleanup(context.stop)

    def post(self, data, filename='poster.png'):
        with app.test_request_context(
            '/films/7/poster',
            method='POST',
            data={'poster': (data, filename)},
            content_type='multipart/form-data',
        ) as context:
            try:
                return upload_film_poster.__wrapped__(7)
            finally:
                context.request.close()

    def test_upload_replace_get_and_delete(self):
        response, status = self.post(image_file('red'))
        self.assertEqual(status, 200)
        first_url = response.json['url']
        first_name = self.connection.state['filename']
        self.assertRegex(first_name, r'^[0-9a-f]{32}\.jpg$')
        self.assertEqual(first_url, '/uploads/posters/' + first_name)
        first_path = os.path.join(self.folder.name, first_name)
        with Image.open(first_path) as saved:
            self.assertEqual(saved.size, (1200, 1800))
            self.assertEqual(saved.format, 'JPEG')

        response, status = self.post(image_file('blue'))
        self.assertEqual(status, 200)
        self.assertNotEqual(response.json['url'], first_url)
        self.assertFalse(os.path.exists(first_path))

        with app.test_request_context('/films/7/poster'):
            response, status = get_film_poster(7)
        self.assertEqual(status, 200)
        self.assertEqual(response.json['url'], self.connection.state['url'])

        last_path = os.path.join(self.folder.name, self.connection.state['filename'])
        with app.test_request_context('/films/7/poster', method='DELETE'):
            response, status = delete_film_poster.__wrapped__(7)
        self.assertEqual(status, 200)
        self.assertIsNone(response.json['url'])
        self.assertFalse(os.path.exists(last_path))
        self.assertEqual(self.connection.commits, 3)

    def test_invalid_image_is_rejected(self):
        response, status = self.post(io.BytesIO(b'not an image'))
        self.assertEqual(status, 400)
        self.assertIsNone(self.connection.state['url'])

    def test_oversized_file_is_rejected(self):
        with patch('app.MAX_POSTER_BYTES', 32):
            response, status = self.post(io.BytesIO(b'x' * 33))
        self.assertEqual(status, 413)
        self.assertIsNone(self.connection.state['url'])


if __name__ == '__main__':
    unittest.main()
