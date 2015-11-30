/**
 * @author rik
 */
import AdapterValidator from '../../src/validators/Adapter';
// @todo: refactor some tests to validators/Adapters.spec.js
// validate AdapterValidator.constructor is called
describe(`AdapterValidator`, () => {

  it(`should be a function`, (done) => {
    expect(AdapterValidator).to.be.an('object');
    done();
  });

  describe(`AdapterValidator#construct(options)`, () => {
    let validAdapterValidatorOptions = {};
    let validAdapterValidatorOptionsWithEvents = {};
    let i = 0;

    beforeEach(done => {
      validAdapterValidatorOptions = {
        name: 'adapter' + i,
        communicator: {},
        request: Promise.resolve.bind(Promise),
        connect: Promise.resolve.bind(Promise),
        disconnect: Promise.resolve.bind(Promise)
      };

      validAdapterValidatorOptionsWithEvents = {
        name: 'adapter' + i,
        communicator: {},
        request: Promise.resolve.bind(Promise),
        connect: Promise.resolve.bind(Promise),
        disconnect: Promise.resolve.bind(Promise),
        events: true,
        on: function () {
        },
        emit: function () {
        }
      };

      i++;

      done();
    });

    it(`should throw an error when called without a name`, (done) => {
      expect(function () {
        delete validAdapterValidatorOptions.name;
        return AdapterValidator.construct(validAdapterValidatorOptions)
      }).to.throw(Error);
      done();
    });

    it(`should throw an error when called without a request method`, (done) => {
      expect(function () {
        delete validAdapterValidatorOptions.request;
        return AdapterValidator.construct(validAdapterValidatorOptions)
      }).to.throw(Error);
      done();
    });

    it(`should throw an error when called without a connect method`, (done) => {
      delete validAdapterValidatorOptions.connect;
      expect(function () {
        return AdapterValidator.construct(validAdapterValidatorOptions)
      }).to.throw(Error);
      done();
    });

    it(`should throw an error when called without a disconnect method`, (done) => {
      delete validAdapterValidatorOptions.disconnect;
      expect(function () {
        return AdapterValidator.construct(validAdapterValidatorOptions)
      }).to.throw(Error);
      done();
    });

    it(`should throw an error when called with events set to true but without an on method`, (done) => {
      delete validAdapterValidatorOptionsWithEvents.on;
      expect(function () {
        return AdapterValidator.construct(validAdapterValidatorOptionsWithEvents)
      }).to.throw(Error);
      done();
    });

    it(`should throw an error when called with events set to true but without an emit method`, (done) => {
      delete validAdapterValidatorOptionsWithEvents.emit;
      expect(function () {
        return AdapterValidator.construct(validAdapterValidatorOptionsWithEvents)
      }).to.throw(Error);
      done();
    });

  });

});