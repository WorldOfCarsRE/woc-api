/* global ArrayCollection: writeable */

const CatalogPlayerStoreItem = global.CatalogPlayerStoreItem
ArrayCollection = global.ArrayCollection

class CatalogCarItem extends CatalogPlayerStoreItem {
  constructor () {
    super()

    this.tryOnRotation = 0
    this.tryOnEmoteIds = new ArrayCollection()
  }
}

module.exports = CatalogCarItem
