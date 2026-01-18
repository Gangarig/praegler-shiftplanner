/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1154348487")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "date3387360544",
    "max": "",
    "min": "",
    "name": "weekStart",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1154348487")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "date3387360544",
    "max": "",
    "min": "",
    "name": "weekStart",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
})
