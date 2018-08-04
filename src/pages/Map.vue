<template>
  <Page class="page">
    <ActionBar class="action-bar" title="Erkunden"></ActionBar>
    <GridLayout>
      <Mapbox
        :accessToken="config.mapbox.token"
        :latitude="startLocation.latitude"
        :longitude="startLocation.longitude"
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

export default {
  data() {
    return {
      config,
      markers: [],
      startLocation: {
        latitude: 2.3522219,
        longitude: 48.856614,
      },
    }
  },
  created() {
    this.setStartLocation()
  },
  methods: {
    setStartLocation() {
      isEnabled().then(enabled => {
        if (!enabled) {
          return enableLocationRequest().then(() => {
            getCurrentLocation().then(location => {
              this.startLocation = location
            })
          })
        }

        getCurrentLocation().then(location => {
          this.startLocation = location
        })
      })
    },
    async onMapReady({ map }) {
      const { location } = await map.getUserLocation()

      map.trackUser({
        mode: 'FOLLOW',
        animated: true,
      })

      this.loadMarkers(map, location.lat, location.lng)
    },
    async loadMarkers(map, lat, lng) {
      const pages = await wikipedia.markers.getInRadius(lat, lng, 5000).then(json => json.query.pages)

      this.markers = [...Object.keys(pages)].map(key => {
        const page = pages[key]

        return {
          title: page.title,
          lat: page.coordinates[0].lat,
          lng: page.coordinates[0].lon,
          onTap: marker => console.log(page),
          onCalloutTap: () => {
            this.$navigateTo(EntryPage, {
              context: {
                propsData: {
                  pageId: key,
                  title: page.title,
                },
              },
            })
          },
        }
      })

      map.addMarkers(this.markers)
    },
  },
}
</script>
