import unittest
from app import app

class FlaskAppTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_index_route(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        response_text = response.get_data(as_text=True)
        self.assertIn('ポモドーロタイマー', response_text)
        self.assertIn('id="timer-display"', response_text)
        self.assertIn('id="start-btn"', response_text)
        self.assertIn('id="pause-btn"', response_text)
        self.assertIn('id="reset-btn"', response_text)

if __name__ == '__main__':
    unittest.main()
