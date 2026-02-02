/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(10, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3887672816",
    "hidden": false,
    "id": "relation1323707901",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "defaultStation",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "json435752195",
    "maxSize": 0,
    "name": "defaultWeekdays",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text209928189",
    "max": 0,
    "min": 0,
    "name": "defaultNote",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("relation1323707901")

  // remove field
  collection.fields.removeById("json435752195")

  // remove field
  collection.fields.removeById("text209928189")

  return app.save(collection)
})
