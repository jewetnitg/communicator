/**
 * @author rik
 */
import _ from 'lodash';

function replaceSplatsInRouteWithData(route = "", data = {}) {
  const regex = /:(\w+)/g;
  const matches = route.match(regex);
  let str = route;

  _.each(matches, (match, index) => {
    let value = data[Array.isArray(data) ? index : match.replace(':', '')];
    // replace missing splats with an empty string
    value = typeof value === 'undefined' ? '' : value;
    str = str.replace(match, value);
  });

  return str;
}

export default replaceSplatsInRouteWithData;