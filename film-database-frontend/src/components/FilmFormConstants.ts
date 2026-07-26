// FilmFormConstants.ts

import * as Yup from 'yup';
import { FilmFormData } from './types'; // Assuming types.ts is in the same directory

// Initial values for adding a new film.
export const initialValues: FilmFormData = {
  title: '',
  release_year: null,
  runtime: '',
  synopsis: '',
  av_annotate_link: '',
  productionDetails: {
    production_timeframe: '',
    shooting_city: '',
    shooting_country: '',
    post_production_studio: '',
    production_comments: '',
  },
  authors: {
    screenwriter: '',
    screenwriter_comment: '',
    filmmaker: '',
    filmmaker_comment: '',
    executive_producer: '',
    executive_producer_comment: '',
  },
  productionTeam: [{ department: '', name: '', role: '', comment: '' }],
  actors: '',
  equipment: { equipment_name: '', description: '', comment: '' },
  documents: { document_type: '', file_url: '', comment: '' },
  institutionalInfo: {
    production_company: '',
    funding_company: '',
    funding_comment: '',
    source: '',
    institutional_city: '',
    institutional_country: '',
  },
  screenings: [
    {
      screening_date: '',
      screening_city: '',
      screening_country: '',
      organizers: '',
      format: '',
      audience: '',
      film_rights: '',
      comment: '',
      source: '',
    },
  ],
  posterFile: null,
  imageFiles: [],
  wantsMoreImages: false,
  wantsPoster: false,
  filmDocument: null,
};

// Yup validation schema.
export const validationSchema = Yup.object().shape({
  release_year: Yup.number().nullable(),
  // productionDetails: Yup.object().shape({
  //   shooting_city: Yup.string().required('City is required'),
  //   shooting_country: Yup.string().required('Country is required'),
  // }),
  // institutionalInfo: Yup.object().shape({
  //   institutional_city: Yup.string().required('City is required'),
  //   institutional_country: Yup.string().required('Country is required'),
  // }),
  // screenings: Yup.array().of(
  //   Yup.object().shape({
  //     screening_city: Yup.string().required('City is required'),
  //     screening_country: Yup.string().required('Country is required'),
  //   })
  // ),
  // Additional validations can be added here...
});