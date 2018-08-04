<template>
  <Page class="page">
    <ActionBar class="action-bar" :title="title"></ActionBar>
    <ScrollView>
      <StackLayout>
        <Image :src="image.src" stretch="aspectFit" loadMode="sync" />
        <HtmlView :html="htmlView" class="html-view" />
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

    // console.log(entry.query.pages)
    console.log(json)
    console.log(json.query.pages[this.pageId])

    if (typeof page.thumbnail !== 'undefined') {
      const thumbnail = page.thumbnail

      if (typeof thumbnail.source !== 'undefined') {
        this.image.src = thumbnail.source

        console.log(this.image.src)
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
