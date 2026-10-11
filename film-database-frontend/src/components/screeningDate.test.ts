import { validationSchema } from './FilmFormConstants';
import { formatScreeningDate } from './screeningDate';

const screening = (precision: string, year = '', month = '', day = '') => ({
  screening_precision: precision,
  screening_year: year,
  screening_month: month,
  screening_day: day,
});

test('formats dates without inventing missing parts', () => {
  expect(formatScreeningDate({ screening_year: 1963 })).toBe('1963');
  expect(formatScreeningDate({ screening_year: 1963, screening_month: 6 })).toBe('June 1963');
  expect(formatScreeningDate({ screening_year: 1964, screening_month: 2, screening_day: 29 }))
    .toBe('February 29, 1964');
  expect(formatScreeningDate({})).toBe('Unknown');
});

test('accepts unknown, year, month/year, and valid full dates', async () => {
  for (const entry of [
    screening('unknown'),
    screening('year', '1963'),
    screening('month', '1963', '6'),
    screening('day', '1964', '2', '29'),
  ]) {
    await expect(validationSchema.validate({ title: 'Test film', screenings: [entry] }))
      .resolves.toBeTruthy();
  }
});

test('rejects missing components and impossible full dates', async () => {
  for (const entry of [
    screening('year'),
    screening('month', '1963'),
    screening('day', '1963', '2', '29'),
    screening('day', '1963', '4', '31'),
  ]) {
    await expect(validationSchema.validate({ title: 'Test film', screenings: [entry] }))
      .rejects.toThrow();
  }
});
