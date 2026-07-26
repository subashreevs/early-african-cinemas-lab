// FilmFormWrapper.tsx

import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import FormContentInternal from './FormContent';
import { FilmFormData } from './types';
import { validationSchema as defaultValidationSchema } from './FilmFormConstants';

interface FilmFormWrapperProps {
  initialVals: FilmFormData;
  onSubmit: (
    values: FilmFormData,
    actions: FormikHelpers<FilmFormData>
  ) => Promise<void> | void;
  setIsDirty: (dirty: boolean) => void;
  validationSchema?: typeof defaultValidationSchema;
}

const FilmFormWrapper: React.FC<FilmFormWrapperProps> = ({
  initialVals,
  onSubmit,
  setIsDirty,
  validationSchema,
}) => {
  return (
    <Formik
      initialValues={initialVals}
      validationSchema={validationSchema || defaultValidationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      <FormContentInternal setIsDirty={setIsDirty} />
    </Formik>
  );
};

export default FilmFormWrapper;