import Communicator from './src/factories/Communicator';

const Adapter = Communicator.Adapter;
const Connection = Communicator.Connection;
const Request = Communicator.Request;

export {
  Adapter as Adapter,
  Connection as Connection,
  Request as Request
}
export default Communicator;