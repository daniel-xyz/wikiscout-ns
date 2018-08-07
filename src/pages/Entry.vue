<template>
  <Page class="page">
    <ActionBar class="action-bar" :title="title"></ActionBar>
    <ScrollView>
      <StackLayout>
        <HtmlView :html="htmlView" class="html-view" />
        <Image :src="image.src" stretch="aspectFit" />
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script>
import wikipedia from '../services/wikipedia'

export default {
  data() {
    return {
      image: {
        src: '',
        width: '',
      },
      htmlView: '',
    }
  },
  props: {
    pageId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  async created() {
    const json = await wikipedia.markers.getByTitle(this.title)
    const page = json.query.pages[this.pageId]

    if (typeof page.thumbnail !== 'undefined') {
      const thumbnail = page.thumbnail

      if (typeof thumbnail.source !== 'undefined') {
        this.image.src = thumbnail.source
      }

      if (typeof thumbnail.width !== 'undefined') {
        this.image.width = thumbnail.width
      }
    }

    if (typeof page !== 'undefined') {
      this.htmlView = '<font size="4" face="Helvetica">'.concat(page.extract, '</font>')
    }
  },
}
</script>

<style lang="scss" scoped>
.html-view {
  margin: 8;
}
</style>
