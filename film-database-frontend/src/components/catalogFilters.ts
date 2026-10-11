export interface CatalogFilm {
  id: string;
  title: string;
  year: number | null;
  posterUrl: string;
  people: string[];
  productionLocations: string[];
  institutionalLocations: string[];
  screeningLocations: string[];
}

export type LocationScope = 'all' | 'production' | 'institutional' | 'screening';
export type CatalogSort = 'title_asc' | 'title_desc' | 'year_asc' | 'year_desc';

export interface CatalogFilters {
  search: string;
  yearFrom: string;
  yearTo: string;
  person: string;
  place: string;
  locationScope: LocationScope;
  sort: CatalogSort;
}

export const initialCatalogFilters: CatalogFilters = {
  search: '',
  yearFrom: '',
  yearTo: '',
  person: '',
  place: '',
  locationScope: 'all',
  sort: 'title_asc',
};

const normalized = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();

const matches = (values: string[], query: string) =>
  values.some((value) => normalized(value).includes(query));

const locationsFor = (film: CatalogFilm, scope: LocationScope) => {
  if (scope === 'production') return film.productionLocations;
  if (scope === 'institutional') return film.institutionalLocations;
  if (scope === 'screening') return film.screeningLocations;
  return [
    ...film.productionLocations,
    ...film.institutionalLocations,
    ...film.screeningLocations,
  ];
};

export function filterAndSortFilms(films: CatalogFilm[], filters: CatalogFilters): CatalogFilm[] {
  const search = normalized(filters.search);
  const person = normalized(filters.person);
  const place = normalized(filters.place);
  const from = filters.yearFrom ? Number(filters.yearFrom) : null;
  const to = filters.yearTo ? Number(filters.yearTo) : null;

  if (from !== null && to !== null && from > to) return [];

  return films.filter((film) => {
    const scopedLocations = locationsFor(film, filters.locationScope);
    if (search && !matches([
      film.title, String(film.year ?? ''), ...film.people, ...locationsFor(film, 'all'),
    ], search)) return false;
    if (from !== null && (film.year === null || film.year < from)) return false;
    if (to !== null && (film.year === null || film.year > to)) return false;
    if (person && !matches(film.people, person)) return false;
    if (place && !matches(scopedLocations, place)) return false;
    return true;
  }).sort((a, b) => {
    const titleOrder = a.title.localeCompare(b.title, undefined, { sensitivity: 'base', numeric: true })
      || Number(a.id) - Number(b.id);
    if (filters.sort === 'title_desc') return -titleOrder;
    if (filters.sort === 'title_asc') return titleOrder;
    if (a.year === null) return b.year === null ? titleOrder : 1;
    if (b.year === null) return -1;
    const yearOrder = filters.sort === 'year_asc' ? a.year - b.year : b.year - a.year;
    return yearOrder || titleOrder;
  });
}
