/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3229316009")

  // remove field
  collection.fields.removeById("number3852478864")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "select3852478864",
    "maxSelect": 1,
    "name": "day",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3229316009")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number3852478864",
    "max": null,
    "min": null,
    "name": "day",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // remove field
  collection.fields.removeById("select3852478864")

  return app.save(collection)
})
