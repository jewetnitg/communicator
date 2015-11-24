/**
 * @author rik
 */
import communicator from '../src/communicator';

describe(`communicator`, () => {

  it(`should be an object`, (done) => {
    expect(communicator).to.be.an('object');
    done();
  });

});