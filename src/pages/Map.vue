<template>
  <Page class="page">
    <ActionBar class="action-bar" title="Erkunden"></ActionBar>
    <GridLayout>
      <Mapbox
        v-if="locationLoaded"
        :accessToken="config.mapbox.token"
        :latitude="startLocation.lat"
        :longitude="startLocation.lng"
        hideCompass="false"
        zoomLevel="15"
        showUserLocation="true"
        disableZoom="false"
        disableRotation="false"
        disableScroll="false"
        disableTilt="false"
        @mapReady="onMapReady($event)">
      </Mapbox>
    </GridLayout>
  </Page>
</template>

<script>
import config from '../../config'
import wikipedia from '../services/wikipedia'
import EntryPage from './Entry.vue'
import { isEnabled, enableLocationRequest, getCurrentLocation } from 'nativescript-geolocation'

const timerModule = require('tns-core-modules/timer')

export default {
  data() {
    return {
      config,
      markerIds: [],
      locationLoaded: false,
      startLocation: {
        lat: 2.3522219,
        lng: 48.856614,
      },
      lastLoadedMarkersAt: {
        lat: null,
        lng: null,
      },
      location: {
        lat: null,
        lng: null,
      },
    }
  },
  created() {
    this.setStartLocation()
  },
  methods: {
    async setStartLocation() {
      const isGeoEnabled = await isEnabled()

      if (!isGeoEnabled) {
        return enableLocationRequest()
          .then(() => this.setStartLocation())
          .catch(() => (this.locationLoaded = true))
      }

      getCurrentLocation().then(location => {
        this.startLocation.lat = location.latitude
        this.startLocation.lng = location.longitude
        this.locationLoaded = true
      })
    },
    async onMapReady({ map }) {
      this.location = await map.getUserLocation().then(obj => obj.location)

      this.loadAndReplaceMarkers(map)
      this.trackLocation(map)
    },
    async loadAndReplaceMarkers(map) {
      const pages = await wikipedia.markers.getInRadius(this.location.lat, this.location.lng, 2000).then(json => json.query.pages)
      const pageIds = [...Object.keys(pages)]

      // only get marker id's that haven't been loaded yet
      const filteredMarkers = pageIds.filter(id => this.markerIds.indexOf(id) === -1)

      this.removeOldMarkers(map, pageIds)

      const markers = filteredMarkers.map(id => {
        const page = pages[id]

        this.markerIds.push(id)

        return {
          id,
          title: page.title,
          lat: page.coordinates[0].lat,
          lng: page.coordinates[0].lon,
          // onTap: marker => console.log(page),
          onCalloutTap: () => {
            this.$navigateTo(EntryPage, {
              context: {
                propsData: {
                  pageId: id,
                  title: page.title,
                },
              },
            })
          },
        }
      })

      map.addMarkers(markers)
      this.lastLoadedMarkersAt = this.location
    },
    removeOldMarkers(map, validMarkerIds) {
      const oldMarkers = []

      this.markerIds.forEach((id, index) => {
        if (validMarkerIds.indexOf(id) === -1) {
          this.$delete(this.markerIds, index)
          oldMarkers.push(id)
        }
      })

      map.removeMarkers(oldMarkers)
    },
    distanceInMeters(location1, location2) {
      const lat1 = location1.lat
      const lng1 = location1.lng
      const lat2 = location2.lat
      const lng2 = location2.lng

      const radlat1 = Math.PI * lat1 / 180
      const radlat2 = Math.PI * lat2 / 180
      const theta = lng1 - lng2
      const radtheta = Math.PI * theta / 180

      let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)

      if (dist > 1) {
        dist = 1
      }

      dist = Math.acos(dist)
      dist = dist * 180 / Math.PI
      dist = dist * 60 * 1.1515 * 1609.344

      return dist
    },
    loadMarkersAfterLocationChange(map) {
      if (this.distanceInMeters(this.lastLoadedMarkersAt, this.location) > 150) this.loadAndReplaceMarkers(map, this.location)
    },
    trackLocation(map) {
      map.trackUser({
        mode: 'FOLLOW',
        animated: true,
      })

      timerModule.setInterval(async () => {
        this.location = await map.getUserLocation().then(obj => obj.location)

        this.loadMarkersAfterLocationChange(map)
      }, 10000)
    },
  },
}
</script>
