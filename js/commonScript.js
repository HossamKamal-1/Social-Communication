function getQueryParam(queryParamName) {
  return new URLSearchParams(location.search).get(queryParamName);
}