import os
import unittest
from datetime import date

os.environ.setdefault('DATABASE_URL', 'postgresql://unused/unused')
os.environ.setdefault('JWT_SECRET_KEY', 'test-only-secret')

from app import insert_screenings, screening_date_parts, validate_film_data


class CaptureCursor:
    def __init__(self):
        self.queries = []

    def execute(self, query, params):
        self.queries.append((query, params))


class ScreeningDateTests(unittest.TestCase):
    def test_partial_dates_do_not_invent_a_day(self):
        self.assertEqual(screening_date_parts({'screening_year': '1963'}),
                         (None, 1963, None, None))
        self.assertEqual(screening_date_parts({
            'screening_year': '1963', 'screening_month': '6',
        }), (None, 1963, 6, None))

    def test_full_and_legacy_dates(self):
        expected = (date(1964, 2, 29), 1964, 2, 29)
        self.assertEqual(screening_date_parts({
            'screening_year': '1964', 'screening_month': '2', 'screening_day': '29',
        }), expected)
        self.assertEqual(screening_date_parts({'screening_date': '1964-02-29'}), expected)

    def test_invalid_dates_are_rejected_before_saving(self):
        for screening in (
            {'screening_year': '1963', 'screening_month': '2', 'screening_day': '29'},
            {'screening_year': '1963', 'screening_month': '13'},
            {'screening_month': '6'},
            {'screening_year': '1963.5'},
            {'screening_date': '1963-02-29'},
        ):
            with self.subTest(screening=screening):
                self.assertIsNotNone(validate_film_data({
                    'title': 'Test film', 'screenings': [screening],
                }))

    def test_date_detail_must_match_supplied_parts(self):
        for screening in (
            {'screening_precision': 'day', 'screening_year': '1963'},
            {'screening_precision': 'month', 'screening_year': '1963'},
            {'screening_precision': 'unknown', 'screening_year': '1963'},
            {'screening_precision': 'nonsense'},
        ):
            with self.subTest(screening=screening):
                self.assertIsNotNone(validate_film_data({
                    'title': 'Test film', 'screenings': [screening],
                }))

    def test_unknown_screening_with_notes_is_preserved(self):
        cursor = CaptureCursor()
        insert_screenings(cursor, 7, [
            {'screening_precision': 'unknown', 'screening_city': 'Dakar'},
            {'screening_precision': 'unknown', 'screening_city': ''},
        ])
        self.assertEqual(len(cursor.queries), 1)
        self.assertEqual(cursor.queries[0][1][:6], (7, None, None, None, None, 'Dakar'))

    def test_month_year_insert_has_null_full_date(self):
        cursor = CaptureCursor()
        insert_screenings(cursor, 8, [{
            'screening_year': '1963', 'screening_month': '6', 'screening_day': '',
        }])
        self.assertEqual(cursor.queries[0][1][:5], (8, None, 1963, 6, None))


if __name__ == '__main__':
    unittest.main()
