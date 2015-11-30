/**
 * @author rik
 */
import Communicator from '../../src/factories/Communicator';

describe(`Communicator`, () => {

  it(`should be a function`, (done) => {
    expect(Communicator).to.be.a('function');
    done();
  });

});