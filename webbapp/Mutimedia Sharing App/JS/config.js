window.API = {
  list: "https://prod-61.uksouth.logic.azure.com:443/workflows/536afacc9b684aba8451450daab41da6/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=QGBAYaa5eFQCMDh-Kf-1VU9AtBGOrLAEjPYnvzjQ65U",
  create: "https://prod-47.uksouth.logic.azure.com/workflows/d0a9e39332ee472aa2db5f1c46af68c5/triggers/When_an_HTTP_request_is_received/paths/invoke/media?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=YWhPfJGSWQfY1mn-h2uAHrTucysTvAD6wMPSJFKckX4",
  getById: "https://prod-13.uksouth.logic.azure.com/workflows/f844956f93d44e798b36c7c597c79713/triggers/When_an_HTTP_request_is_received/paths/invoke/media/{id}?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=mmYMds_Sz4nqq7sU51qiPGpFxm77_39ADtwwx5g4vuc",
  update: "https://prod-05.uksouth.logic.azure.com/workflows/efce6d73891443628b8d813359ea1f84/triggers/When_an_HTTP_request_is_received/paths/invoke/media/{id}?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=ViustQzakxbEMYdEQsleUd-O3T5WQoqNDCH2gsEJJEc",
  remove: "https://prod-42.uksouth.logic.azure.com/workflows/72e82fe6a6c448f084e5cde163ea5798/triggers/When_an_HTTP_request_is_received/paths/invoke/media/%7Bid%7D?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=PR2pdkkLFRxQg_azlfcvGMUPM9xxAWlf9tT9Mwb5MpY"

};

window.withId = (url, id) => url.replace("{id}", encodeURIComponent(id));
