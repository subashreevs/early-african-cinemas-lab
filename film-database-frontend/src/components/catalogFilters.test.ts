import { CatalogFilm, filterAndSortFilms, initialCatalogFilters } from './catalogFilters';

const films: CatalogFilm[] = [
  {
    id: '1', title: 'Borom Sarret', year: 1963, posterUrl: '',
    people: ['Ousmane Sembène'], productionLocations: ['Dakar', 'Senegal'],
    institutionalLocations: [], screeningLocations: ['Paris', 'France'],
  },
  {
    id: '2', title: 'La Noire de...', year: 1966, posterUrl: '',
    people: ['Ousmane Sembène', 'Mbissine Thérèse Diop'],
    productionLocations: ['Dakar'], institutionalLocations: ['France'],
    screeningLocations: [],
  },
  {
    id: '3', title: 'Unknown film', year: null, posterUrl: '',
    people: [], productionLocations: [], institutionalLocations: [], screeningLocations: [],
  },
];

test('searches real names and places without requiring accents', () => {
  const result = filterAndSortFilms(films, { ...initialCatalogFilters, search: 'sembene' });
  expect(result.map((film) => film.id)).toEqual(['1', '2']);
  expect(filterAndSortFilms(films, { ...initialCatalogFilters, search: 'paris' })[0].id).toBe('1');
});

test('combines inclusive release years, person, and scoped place', () => {
  const result = filterAndSortFilms(films, {
    ...initialCatalogFilters, yearFrom: '1963', yearTo: '1963',
    person: 'Sembène', place: 'Paris', locationScope: 'screening',
  });
  expect(result.map((film) => film.id)).toEqual(['1']);
  expect(filterAndSortFilms(films, {
    ...initialCatalogFilters, place: 'Paris', locationScope: 'production',
  })).toEqual([]);
  expect(filterAndSortFilms(films, {
    ...initialCatalogFilters, search: 'Paris', locationScope: 'production',
  }).map((film) => film.id)).toEqual(['1']);
});

test('sorts by release year with unknown years last', () => {
  expect(filterAndSortFilms(films, { ...initialCatalogFilters, sort: 'year_desc' })
    .map((film) => film.id)).toEqual(['2', '1', '3']);
  expect(filterAndSortFilms(films, { ...initialCatalogFilters, sort: 'year_asc' })
    .map((film) => film.id)).toEqual(['1', '2', '3']);
});

test('an inverted year range has no matches', () => {
  expect(filterAndSortFilms(films, {
    ...initialCatalogFilters, yearFrom: '1970', yearTo: '1960',
  })).toEqual([]);
});
