/* eslint-disable @typescript-eslint/no-require-imports */
import Ajv from 'ajv';

const ajv = new Ajv({
  allErrors: true,
});
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

export default {
  schemaValidator: ajv,
};
