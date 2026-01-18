/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3229316009")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"boss\" || @request.auth.role = \"admin\"\n",
    "deleteRule": "@request.auth.role = \"boss\" || @request.auth.role = \"admin\"\n",
    "listRule": "@request.auth.id != \"\"\n",
    "updateRule": "@request.auth.role = \"boss\" || @request.auth.role = \"admin\"\n",
    "viewRule": "@request.auth.id != \"\"\n"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3229316009")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
