/* eslint-disable @typescript-eslint/no-require-imports */
import * as Ajv from 'ajv';

export default {
  get schemaValidator() {
    const ajv = new Ajv({
      allErrors: true,
    });
    ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
    return ajv;
  },
};
