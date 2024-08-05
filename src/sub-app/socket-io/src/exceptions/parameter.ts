export class ParameterException extends Error {
  constructor(message?: string) {
    super(message || 'Invalid Parameters');
    this.name = 'ParameterException';
  }
}
