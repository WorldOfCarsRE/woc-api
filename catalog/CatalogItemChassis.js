/* global ArrayCollection: writeable */
/* global CatalogChassisJointDynamic: writeable */
/* global CatalogChassisJointStatic: writeable */
/* global CatalogChassisOffset, CatalogChassisSlot */

const CatalogCarItem = require('./CatalogCarItem')
const fs = require('fs')
const { XMLParser } = require('fast-xml-parser')

ArrayCollection = global.ArrayCollection
CatalogChassisJointDynamic = global.CatalogChassisJointDynamic
CatalogChassisJointStatic = global.CatalogChassisJointStatic

class CatalogItemChassis extends CatalogCarItem {
  constructor (name) {
    super()

    // The base properties are the same throughout all chassis'.
    // They don't need changing.
    this.baseProperties = {}
    this.baseProperties.body_main = 'body'
    this.baseProperties.eye_left = 'eye_left'
    this.baseProperties.eye_right = 'eye_right'

    this.baseProperties.eyelids_male = 'car_t_cst_eyl_avatar.jpg'
    this.baseProperties.eyelids_female = 'car_t_cst_eyl_avatar_female.jpg'

    this.baseProperties.eyelids_top = 'eyelid_top'
    this.baseProperties.eyelids_bottom = 'eyelid_bot'

    this.baseProperties.wheels_left_front = 'rim_left_front'
    this.baseProperties.wheels_left_rear = 'rim_left_rear'
    this.baseProperties.wheels_right_front = 'rim_right_front'
    this.baseProperties.wheels_right_rear = 'rim_right_rear'

    this.baseProperties.tirewalls_left_front = 'tirewall_left_front'
    this.baseProperties.tirewalls_left_rear = 'tirewall_left_rear'
    this.baseProperties.tirewalls_right_front = 'tirewall_right_front'
    this.baseProperties.tirewalls_right_rear = 'tirewall_right_rear'

    this.modelUrl = `car_r_chr_avt_${name}.smod`

    const xmlData = fs.readFileSync(`assets/chassis/${name}.xml`, 'utf-8')
    const parser = new XMLParser({ ignoreAttributes: false })
    const config = parser.parse(xmlData).config

    this.dynamicJoints = new ArrayCollection()
    this.staticJoints = new ArrayCollection()

    this.offsets = new ArrayCollection()
    this.slots = new ArrayCollection()

    // Joints
    const joints = config.joints
    // Dynamic Joints
    const dynamic = joints.defaults[0].joint
    for (const joint of dynamic) {
      const dynamicJoint = new CatalogChassisJointDynamic()
      dynamicJoint.name = joint['@_name']
      dynamicJoint.value = Number(joint['@_value'])
      dynamicJoint.min = Number(joint['@_min'])
      dynamicJoint.max = Number(joint['@_max'])
      dynamicJoint.type = joint['@_type']

      if (joint.linked) {
        joint.linked.forEach(link => {
          dynamicJoint.linked.push(link['@_name'])
        })
      }

      this.dynamicJoints.push(dynamicJoint)
    }
    // Static Joints
    const staticJoints = joints.defaults[1].joint
    for (const joint of staticJoints) {
      const staticJoint = new CatalogChassisJointStatic()
      staticJoint.name = joint['@_name']
      staticJoint.tx = Number(joint['@_tx'])
      staticJoint.ty = Number(joint['@_ty'])
      staticJoint.tz = Number(joint['@_tz'])

      staticJoint.sx = Number(joint['@_sx'])
      staticJoint.sy = Number(joint['@_sy'])
      staticJoint.sz = Number(joint['@_sz'])

      this.staticJoints.push(staticJoint)
    }

    // Offsets
    for (const joint of joints.offsets.joint) {
      const offset = new CatalogChassisOffset()
      offset.name = joint['@_name']

      offset.x = Number(joint['@_x'])
      offset.y = Number(joint['@_y'])
      offset.z = Number(joint['@_z'])

      this.offsets.push(offset)
    }

    // Decals (Slots)
    for (const decal of config.decals.decal) {
      const slot = new CatalogChassisSlot()
      slot.pos = decal['@_pos']
      slot.x = Number(decal['@_x'])
      slot.y = Number(decal['@_y'])
      slot.frameWidth = Number(decal['@_frameWidth'])
      slot.frameHeight = Number(decal['@_frameHeight'])

      this.slots.push(slot)
    }

    // this.shading = 'car_t_chr_avt_shadow.png';
    // The shading URL below seems to be correct but kept the above URL just in case
    this.shading = config.shading.split('/')[4]
    this.subClip = config.subClip
    this.base = config.base
  }
}

module.exports = CatalogItemChassis
