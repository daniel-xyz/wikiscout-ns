<template>
  <Page class="page">
    <ActionBar class="action-bar" title="Erkunden"></ActionBar>
    <GridLayout>
      <Mapbox
        :accessToken="config.mapbox.token"
        latitude="37.7397"
        longitude="-121.4252"
        hideCompass="true"
        zoomLevel="12"
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

export default {
  data() {
    return {
      config,
      markers: [],
    }
  },
  methods: {
    onMapReady(event) {
      this.loadMarkers(event.map)
    },
    async loadMarkers(map) {
      const pages = await wikipedia.markers.getInRadius(-121.4252, 37.7397, 5000).then(json => json.query.pages)

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
