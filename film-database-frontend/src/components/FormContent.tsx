// FormContent.tsx

import React, { useEffect } from 'react';
import {
  Form,
  Field,
  FieldArray,
  useFormikContext,
  getIn,
} from 'formik';
import { FilmFormData } from './types'; // Assuming types.ts is in the same directory
// The CSS import '../styles/AdminFilms.css' is expected to be handled by AdminDashboard.tsx
// or you might need to adjust the path if this component is in a different directory structure.

const FormContentInternal: React.FC<{ setIsDirty: (dirty: boolean) => void }> = ({
  setIsDirty,
}) => {
  const { dirty, errors, touched, isSubmitting, values, setFieldValue } =
    useFormikContext<FilmFormData>();

  useEffect(() => {
    setIsDirty(dirty);
  }, [dirty, setIsDirty]);

  return (
    <Form className="admin-form">
      {/* Basic Film Info */}
      <div>
        <label htmlFor="title">Title:</label>
        <Field name="title" type="text" />
      </div>
      <div>
        <label htmlFor="release_year">Release Year:</label>
        <Field name="release_year" type="number" />
      </div>
      <div>
        <label htmlFor="runtime">Runtime:</label>
        <Field name="runtime" type="text" />
      </div>
      <div>
        <label htmlFor="synopsis">Synopsis:</label>
        <Field name="synopsis" as="textarea" />
      </div>
      <div>
        <label htmlFor="av_annotate_link">AV Annotate Link:</label>
        <Field name="av_annotate_link" type="text" />
      </div>

      {/* Production Details */}
      <fieldset>
        <legend>Production Details</legend>
        <div>
          <label htmlFor="productionDetails.production_timeframe">
            Timeframe:
          </label>
          <Field name="productionDetails.production_timeframe" type="text" />
        </div>
        <div>
          <label htmlFor="productionDetails.shooting_city">City:</label>
          <Field name="productionDetails.shooting_city" type="text" />
          {getIn(errors, 'productionDetails.shooting_city') &&
            getIn(touched, 'productionDetails.shooting_city') && (
              <div className="error">
                {getIn(errors, 'productionDetails.shooting_city')}
              </div>
            )}
        </div>
        <div>
          <label htmlFor="productionDetails.shooting_country">Country:</label>
          <Field name="productionDetails.shooting_country" type="text" />
          {getIn(errors, 'productionDetails.shooting_country') &&
            getIn(touched, 'productionDetails.shooting_country') && (
              <div className="error">
                {getIn(errors, 'productionDetails.shooting_country')}
              </div>
            )}
        </div>
        <div>
          <label htmlFor="productionDetails.post_production_studio">
            Post Production Studio:
          </label>
          <Field
            name="productionDetails.post_production_studio"
            type="text"
          />
        </div>
        <div>
          <label htmlFor="productionDetails.production_comments">
            Comments:
          </label>
          <Field name="productionDetails.production_comments" as="textarea" />
        </div>
      </fieldset>

      {/* Authors */}
      <fieldset>
        <legend>Film Authors</legend>
        <div>
          <label htmlFor="authors.screenwriter">Screenwriter:</label>
          <Field name="authors.screenwriter" type="text" />
        </div>
        <div>
          <label htmlFor="authors.screenwriter_comment">
            Screenwriter Comment:
          </label>
          <Field name="authors.screenwriter_comment" type="text" />
        </div>
        <div>
          <label htmlFor="authors.filmmaker">Filmmaker:</label>
          <Field name="authors.filmmaker" type="text" />
        </div>
        <div>
          <label htmlFor="authors.filmmaker_comment">Filmmaker Comment:</label>
          <Field name="authors.filmmaker_comment" type="text" />
        </div>
        <div>
          <label htmlFor="authors.executive_producer">
            Executive Producer:
          </label>
          <Field name="authors.executive_producer" type="text" />
        </div>
        <div>
          <label htmlFor="authors.executive_producer_comment">
            Executive Producer Comment:
          </label>
          <Field name="authors.executive_producer_comment" type="text" />
        </div>
      </fieldset>

      {/* Production Team */}
      <fieldset>
        <legend>Production Team</legend>
        <FieldArray name="productionTeam">
          {({ push, remove, form }) => (
            <div>
              {form.values.productionTeam.map((_: any, index: any) => (
                <div key={index} className="production-team-member">
                  <div>
                    <label htmlFor={`productionTeam.${index}.department`}>
                      Department:
                    </label>
                    <Field
                      name={`productionTeam.${index}.department`}
                      type="text"
                    />
                  </div>
                  <div>
                    <label htmlFor={`productionTeam.${index}.name`}>Name:</label>
                    <Field name={`productionTeam.${index}.name`} type="text" />
                  </div>
                  <div>
                    <label htmlFor={`productionTeam.${index}.role`}>Role:</label>
                    <Field name={`productionTeam.${index}.role`} type="text" />
                  </div>
                  <div>
                    <label htmlFor={`productionTeam.${index}.comment`}>
                      Comment:
                    </label>
                    <Field
                      name={`productionTeam.${index}.comment`}
                      as="textarea"
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-add"
                onClick={() =>
                  push({
                    department: '',
                    name: '',
                    role: '',
                    comment: '',
                  })
                }
              >
                Add Production Team Member
              </button>
            </div>
          )}
        </FieldArray>
      </fieldset>

      {/* Actors */}
      <fieldset>
        <legend>Actors (comma-separated):</legend>
        <div>
          <Field name="actors" type="text" />
        </div>
      </fieldset>

      {/* Equipment */}
      <fieldset>
        <legend>Film Equipment</legend>
        <div>
          <label htmlFor="equipment.equipment_name">Equipment Name:</label>
          <Field name="equipment.equipment_name" type="text" />
        </div>
        <div>
          <label htmlFor="equipment.description">Description:</label>
          <Field name="equipment.description" as="textarea" />
        </div>
        <div>
          <label htmlFor="equipment.comment">Comment:</label>
          <Field name="equipment.comment" as="textarea" />
        </div>
      </fieldset>

      {/* Institutional & Financial Info */}
      <fieldset>
        <legend>Institutional & Financial Information</legend>
        <div>
          <label htmlFor="institutionalInfo.production_company">
            Production Company:
          </label>
          <Field name="institutionalInfo.production_company" type="text" />
        </div>
        <div>
          <label htmlFor="institutionalInfo.funding_company">
            Funding Company:
          </label>
          <Field name="institutionalInfo.funding_company" type="text" />
        </div>
        <div>
          <label htmlFor="institutionalInfo.funding_comment">
            Funding Comment:
          </label>
          <Field name="institutionalInfo.funding_comment" as="textarea" />
        </div>
        <div>
          <label htmlFor="institutionalInfo.source">Source:</label>
          <Field name="institutionalInfo.source" type="text" />
        </div>
        <div>
          <label htmlFor="institutionalInfo.institutional_city">City:</label>
          <Field name="institutionalInfo.institutional_city" type="text" />
          {getIn(errors, 'institutionalInfo.institutional_city') &&
            getIn(touched, 'institutionalInfo.institutional_city') && (
              <div className="error">
                {getIn(errors, 'institutionalInfo.institutional_city')}
              </div>
            )}
        </div>
        <div>
          <label htmlFor="institutionalInfo.institutional_country">
            Country:
          </label>
          <Field name="institutionalInfo.institutional_country" type="text" />
          {getIn(errors, 'institutionalInfo.institutional_country') &&
            getIn(touched, 'institutionalInfo.institutional_country') && (
              <div className="error">
                {getIn(errors, 'institutionalInfo.institutional_country')}
              </div>
            )}
        </div>
      </fieldset>

      {/* Screenings */}
      <fieldset>
        <legend>Film Screenings</legend>
        <FieldArray name="screenings">
          {({ push, remove, form }) => (
            <>
              {form.values.screenings.map((_: any, index: any) => (
                <div key={index} className="screening-member">
                  <div>
                    <label htmlFor={`screenings.${index}.screening_date`}>
                      Screening Date:
                    </label>
                    <Field
                      name={`screenings.${index}.screening_date`}
                      type="date"
                    />
                  </div>
                  <div>
                    <label htmlFor={`screenings.${index}.screening_city`}>
                      City:
                    </label>
                    <Field
                      name={`screenings.${index}.screening_city`}
                      type="text"
                    />
                    {getIn(errors, `screenings.${index}.screening_city`) &&
                      getIn(touched, `screenings.${index}.screening_city`) && (
                        <div className="error">
                          {getIn(
                            errors,
                            `screenings.${index}.screening_city`
                          ) as string}
                        </div>
                      )}
                  </div>
                  <div>
                    <label htmlFor={`screenings.${index}.screening_country`}>
                      Country:
                    </label>
                    <Field
                      name={`screenings.${index}.screening_country`}
                      type="text"
                    />
                    {getIn(errors, `screenings.${index}.screening_country`) &&
                      getIn(
                        touched,
                        `screenings.${index}.screening_country`
                      ) && (
                        <div className="error">
                          {getIn(
                            errors,
                            `screenings.${index}.screening_country`
                          ) as string}
                        </div>
                      )}
                  </div>
                  <div>
                    <label htmlFor={`screenings.${index}.organizers`}>
                      Organizers:
                    </label>
                    <Field
                      name={`screenings.${index}.organizers`}
                      type="text"
                    />
                  </div>
                  <div>
                    <label htmlFor={`screenings.${index}.format`}>Format:</label>
                    <Field name={`screenings.${index}.format`} type="text" />
                  </div>
                  <div>
                    <label htmlFor={`screenings.${index}.audience`}>Audience:</label>
                    <Field name={`screenings.${index}.audience`} type="text" />
                  </div>
                  <div>
                    <label htmlFor={`screenings.${index}.film_rights`}>Film Rights:</label>
                    <Field name={`screenings.${index}.film_rights`} type="text" />
                  </div>
                  <div>
                    <label htmlFor={`screenings.${index}.comment`}>Comment:</label>
                    <Field name={`screenings.${index}.comment`} as="textarea" />
                  </div>
                  <div>
                    <label htmlFor={`screenings.${index}.source`}>Source:</label>
                    <Field name={`screenings.${index}.source`} type="text" />
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-add"
                onClick={() =>
                  push({
                    screening_date: '',
                    screening_city: '',
                    screening_country: '',
                    organizers: '',
                    format: '',
                    audience: '',
                    film_rights: '',
                    comment: '',
                    source: '',
                  })
                }
              >
                Add Screening
              </button>
            </>
          )}
        </FieldArray>
      </fieldset>

      <button type="submit" className="btn-submit" disabled={isSubmitting}>
        Submit
      </button>
    </Form>
  );
};
export default FormContentInternal;