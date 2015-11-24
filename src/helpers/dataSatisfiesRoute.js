/**
 * @author rik
 */
import _ from 'lodash';

function dataSatisfiesRoute(route = "", data = {}) {
  const regex = /:(\w+)/g;
  const matches = route.match(regex);
  let satisfied = true;

  _.each(matches, (match, index) => {
    let value = data[Array.isArray(data) ? index : match.replace(':', '')];
    // replace missing splats with an empty string

    if (typeof value === 'undefined' || value === null) {
      return satisfied = false;
    }
  });

  return satisfied;
}

export default dataSatisfiesRoute;