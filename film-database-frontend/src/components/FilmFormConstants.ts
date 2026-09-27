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
  actors: [{ actor_name: '', character_name: '', comment: '' }],
  equipment: [{ equipment_name: '', description: '', comment: '' }],
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
const hasText = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0;

const actorSchema = Yup.object()
  .shape({
    actor_name: Yup.string(),
    character_name: Yup.string(),
    comment: Yup.string(),
  })
  .test("actor-name-required", function (value) {
    if (
      value &&
      (hasText(value.character_name) || hasText(value.comment)) &&
      !hasText(value.actor_name)
    ) {
      return this.createError({
        path: this.path + ".actor_name",
        message: "Actor name is required when actor details are entered",
      });
    }
    return true;
  });

const equipmentSchema = Yup.object()
  .shape({
    equipment_name: Yup.string(),
    description: Yup.string(),
    comment: Yup.string(),
  })
  .test("equipment-name-required", function (value) {
    if (
      value &&
      (hasText(value.description) || hasText(value.comment)) &&
      !hasText(value.equipment_name)
    ) {
      return this.createError({
        path: this.path + ".equipment_name",
        message: "Equipment name is required when equipment details are entered",
      });
    }
    return true;
  });

const documentSchema = Yup.object()
  .shape({
    document_type: Yup.string(),
    file_url: Yup.string().url("Enter a valid external file URL"),
    comment: Yup.string(),
  })
  .test("document-url-required", function (value) {
    if (
      value &&
      (hasText(value.document_type) || hasText(value.comment)) &&
      !hasText(value.file_url)
    ) {
      return this.createError({
        path: this.path + ".file_url",
        message: "External file URL is required when document details are entered",
      });
    }
    return true;
  });

export const validationSchema = Yup.object().shape({
  title: Yup.string().trim().required("Film title is required"),
  release_year: Yup.number().nullable(),
  actors: Yup.array().of(actorSchema),
  equipment: Yup.array().of(equipmentSchema),
  documents: documentSchema,
});
