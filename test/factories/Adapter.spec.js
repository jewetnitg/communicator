/**
 * @author rik
 */
import _ from 'lodash';

import Adapter from '../../src/factories/Adapter';
import AdapterValidator from '../../src/validators/Adapter';

// @todo test that connect, disconnect and request are lazily loaded
describe(`Adapter`, () => {

  it(`should be a function`, (done) => {
    expect(Adapter).to.be.a('function');
    done();
  });

  describe(`Adapter(options)`, () => {
    let i = 0;
    let validAdapterObject = null;
    let validAdapterObjectWithEvents = null;

    beforeEach((done) => {
      validAdapterObject = {
        name: 'adapter' + i,
        request: Promise.resolve.bind(Promise),
        connect: Promise.resolve.bind(Promise),
        disconnect: Promise.resolve.bind(Promise)
      };

      validAdapterObjectWithEvents = _.defaults({
        name: '_adapter' + i,
        events: true,
        on() {
        },
        emit() {
        }
      }, validAdapterObject);

      i++;

      done();
    });

    it(`should return an object`, (done) => {
      expect(Adapter(validAdapterObject)).to.be.an('object');
      done();
    });

    it(`should call AdapterValidator#construct with the options passed in`, (done) => {
      const construct = AdapterValidator.construct;
      AdapterValidator.construct = mockFunction();

      Adapter(validAdapterObject);

      verify(AdapterValidator.construct)(validAdapterObject);

      AdapterValidator.construct = construct;

      done();
    });

    it(`should expose the provided name on the name property`, (done) => {
      const adapter = Adapter(validAdapterObject);
      const expected = validAdapterObject.name;
      const actual = adapter.name;

      expect(expected).to.be.equal(actual);
      done();
    });

    it(`should expose the provided connect method on the connect property`, (done) => {
      validAdapterObject.connect = mockFunction();

      const adapter = Adapter(validAdapterObject);

      adapter.connect()
        .then(() => {
          verify(validAdapterObject.connect)();
          done();
        });
    });

    it(`should expose the provided disconnect method on the disconnect property`, (done) => {
      validAdapterObject.disconnect = mockFunction();

      const adapter = Adapter(validAdapterObject);

      adapter.disconnect()
        .then(() => {
          verify(validAdapterObject.disconnect)();
          done();
        });
    });

    it(`should expose the provided request method on the request property`, (done) => {
      validAdapterObject.request = mockFunction();

      const adapter = Adapter(validAdapterObject);

      adapter.request()
        .then(() => {
          verify(validAdapterObject.request)();
          done();
        });
    });

    it(`should expose the provided events boolean on the events property`, (done) => {
      const adapter = Adapter(validAdapterObjectWithEvents);
      const expected = validAdapterObjectWithEvents.events;
      const actual = adapter.events;

      expect(expected).to.be.equal(actual);
      done();
    });

    it(`should expose the provided on method on the on property`, (done) => {
      const adapter = Adapter(validAdapterObjectWithEvents);
      const expected = validAdapterObjectWithEvents.on;
      const actual = adapter.on;

      expect(expected).to.be.equal(actual);
      done();
    });

    it(`should expose the provided emit method on the emit property`, (done) => {
      const adapter = Adapter(validAdapterObjectWithEvents);
      const expected = validAdapterObjectWithEvents.emit;
      const actual = adapter.emit;

      expect(expected).to.be.equal(actual);
      done();
    });

  });

});