/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3887672816")

  // remove field
  collection.fields.removeById("text1063427325")

  // remove field
  collection.fields.removeById("number3051925876")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3887672816")

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1063427325",
    "max": 0,
    "min": 0,
    "name": "sortOrder",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number3051925876",
    "max": null,
    "min": null,
    "name": "capacity",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
