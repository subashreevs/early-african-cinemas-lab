// types.ts

// Interface for Screening objects.
export interface Screening {
    screening_date: string;
    screening_city: string;
    screening_country: string;
    organizers: string;
    format: string;
    audience: string;
    film_rights: string;
    comment: string;
    source: string;
  }
  
  // Interface for full film form data.
  export interface FilmFormData {
    title: string;
    release_year: number | null; // Adjusted to match Yup schema
    runtime: string;
    synopsis: string;
    av_annotate_link: string;
    posterFile?: File | null;
    imageFiles?: File[];
    wantsMoreImages?: boolean;
    wantsPoster?: boolean;
  
    productionDetails: {
      production_timeframe: string;
      shooting_city: string;
      shooting_country: string;
      post_production_studio: string;
      production_comments: string;
    };
    authors: {
      screenwriter: string;
      screenwriter_comment: string;
      filmmaker: string;
      filmmaker_comment: string;
      executive_producer: string;
      executive_producer_comment: string;
    };
    productionTeam: Array<{
      department: string;
      name: string;
      role: string;
      comment: string;
    }>;
    actors: string;
    equipment: {
      equipment_name: string;
      description: string;
      comment: string;
    };
    documents: {
      document_type: string;
      file_url: string;
      comment: string;
    };
    institutionalInfo: {
      production_company: string;
      funding_company: string;
      funding_comment: string;
      source: string;
      institutional_city: string;
      institutional_country: string;
    };
    screenings: Screening[];
    filmDocument?: File | null;
  }
  
  // Interface for film list items (for update mode)
  export interface FilmListItem {
    film_id: number;
    title: string;
    posterUrl: string;
  }