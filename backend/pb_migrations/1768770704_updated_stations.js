/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3887672816")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number2161764012",
    "max": null,
    "min": null,
    "name": "pos",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3887672816")

  // remove field
  collection.fields.removeById("number2161764012")

  return app.save(collection)
})
