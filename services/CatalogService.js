/* global CatalogItemRaceSeries: writeable */
/* global CatalogItemRaceLevel: writeable */
/* global CatalogItemSponsor: writeable */
/* global CatalogItemGear: writeable */

/* global libamf:writeable, ArrayCollection:writeable */

CatalogItemRaceSeries = global.CatalogItemRaceSeries
CatalogItemRaceLevel = global.CatalogItemRaceLevel
CatalogItemSponsor = global.CatalogItemSponsor
CatalogItemGear = global.CatalogItemGear
const CatalogItemPuppet = global.CatalogItemPuppet
const CatalogItemNPC = global.CatalogItemNPC

libamf = global.libamf
ArrayCollection = global.ArrayCollection

const { clientData } = require('../constants')

class CatalogService extends libamf.Service {
  constructor () {
    super('catalog')
  }

  getItemsByIds (itemIds) {
    console.log('getItemsByIds:', [...itemIds])

    const array = new ArrayCollection()

    for (const itemId of itemIds) {
      const item = clientData[itemId].classObj
      item.itemId = itemId
      array.push(item)
    }

    return array
  }

  getTreeById (id, depth) {
    console.log('getTreeById:', id, depth)

    const resp = new ArrayCollection()

    if (depth === 2) {
      // Puppet case
      const puppetItem = new CatalogItemPuppet(31009, 'Mater') // Mater npcId
      puppetItem.itemId = 101 // Mater Puppet
      resp.push(puppetItem)

      const npcItem = new CatalogItemNPC()
      npcItem.itemId = 31009 // Mater npcId
      resp.push(npcItem)
    } else {
      resp.push(new CatalogItemRaceSeries(id))
      resp.push(new CatalogItemRaceLevel(1))
    }

    return resp
  }

  getItemsByType (itemType) {
    console.log('getItemsByType:', itemType)

    const resp = new ArrayCollection()

    if (itemType === 'gear') {
      resp.push(new CatalogItemGear(1))
    } else if (itemType === 'sponsor') {
      resp.push(new CatalogItemSponsor())
    }

    return resp
  }

  getItem (itemId) {
    console.log('getItem:', itemId)

    const item = clientData[itemId].classObj
    item.itemId = itemId

    return item
  }
}

module.exports = CatalogService
