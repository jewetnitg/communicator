/**
 * @author rik
 */
import _ from 'lodash';

function concatenateUrls(...urls) {
  let _url = '';

  _.each(urls, (url, index) => {
    if (index % 2 === 0) {
      const nextUrl = urls[index + 1];

      if (nextUrl) {
        _url += concatenateTwoUrls(url, nextUrl);
      }
    }
  });

  return _url || urls[0] || '';
}

function concatenateTwoUrls(url1, url2) {
  const baseUrlEndsWithSlash = !!url1.match(/\/$/g);
  const urlStartsWithSlash = !!url2.match(/^\//g);
  const shouldRemoveOneSlash = baseUrlEndsWithSlash && urlStartsWithSlash;
  const shouldAddASlash = !baseUrlEndsWithSlash && !urlStartsWithSlash;

  if (shouldRemoveOneSlash) {
    url2 = url2.replace(/^\//g, '');
  }

  if (shouldAddASlash) {
    url1 += '/';
  }

  return url1 + url2;
}

export default concatenateUrls;