/**
 * @author rik
 */
import _ from 'lodash';

function extractSplatsFromRoute(route = "") {
  const regex = /:(\w+)/g;
  const matches = route.match(regex);
  const splats = [];

  _.each(matches, (match) => {
    splats.push(match.replace(':', ''));
  });

  return splats;
}

export default extractSplatsFromRoute;