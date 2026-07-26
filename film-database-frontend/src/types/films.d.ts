export interface Film {
    filmId: number;
    title: string;
    description?: string; // General description
  
    // Film Production Tab Data
    productionDetails?: FilmProductionDetails;
  
    // Film Analysis Tab Data
    analysisDetails?: FilmAnalysisDetails;
  
    // Institutional and Financial Information Tab Data
    institutionalFinancialDetails?: FilmInstitutionalFinancialDetails;
  
    // Film Screenings Tab Data
    screeningsDetails?: FilmScreeningsDetails;
  
    // ... you can add other top-level film properties if needed (e.g., posterUrl, etc.)
  }
  
  // --- Interfaces for Tab Data ---
  
  export interface FilmProductionDetails {
    productionTeam?: string[]; // List of production team members
    equipmentUsed?: string;
    shootingDetails?: string;
    // ... other production details
  }
  
  export interface FilmAnalysisDetails {
    avAnnotateLinks?: string[]; // Links to AVAnnotate resources
    analysisTools?: string[]; // List of analysis tools used
    // ... other analysis details
  }
  
  export interface FilmInstitutionalFinancialDetails {
    fundingSources?: string[];
    participatingInstitutions?: string[];
    keyPersonnel?: string[];
    financialFigures?: {
      budget?: string;
      boxOffice?: string;
      // ... other financial figures
    };
    // ... other institutional and financial details
  }
  
  export interface FilmScreeningsDetails {
    screeningEvents?: FilmScreeningEvent[];
    // ... other screening details
  }
  
  export interface FilmScreeningEvent {
    eventName: string;
    location?: string;
    date?: Date;
    eventDetails?: string;
    // ... other screening event details
  }