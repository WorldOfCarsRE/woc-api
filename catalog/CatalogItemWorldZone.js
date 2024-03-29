const CatalogItem = global.CatalogItem

class CatalogItemWorldZone extends CatalogItem {
  constructor (name, visitedRuleId, titleUrl, mapUrl, miniMapUrl, scriptUrl,
    group = '', alias = '', spawn = '') {
    super()

    this.name = name
    this.visitedRuleId = visitedRuleId
    this.outTransitionUrl = 'car_f_trn_gam_loaderTransition.swf'
    this.titleUrl = titleUrl
    this.mapUrl = mapUrl
    this.miniMapUrl = miniMapUrl
    this.scriptUrl = scriptUrl
    this.group = group
    this.alias = alias

    this.dropPoints = {}
    this.dropPoints.default = spawn
  }
}

module.exports = CatalogItemWorldZone
