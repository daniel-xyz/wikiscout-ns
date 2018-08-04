const endpoint = 'https://de.wikipedia.org/w/api.php'

let markers = {
  getInRadius(lat, lng, radius) {
    const url =
      endpoint +
      '?action=query&prop=coordinates|pageimages&colimit=100&piprop=thumbnail&pithumbsize=80&pilimit=50&generator=geosearch&ggscoord=' +
      lat +
      '|' +
      lng +
      '&ggsradius=' +
      radius +
      '&ggslimit=100&format=json&origin=*'

    return fetch(encodeURI(url))
      .then(response => response.json())
      .catch(error => console.error(error))
  },

  getByTitle(title) {
    const url =
      endpoint +
      '?action=query&prop=extracts|pageimages|coordinates&piprop=thumbnail&pithumbsize=700&format=json&exintro=1&origin=*&titles=' +
      title

    return fetch(encodeURI(url))
      .then(response => response.json())
      .catch(error => console.error(error))
  },
}

export default { markers }
