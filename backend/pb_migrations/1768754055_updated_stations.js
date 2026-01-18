/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3887672816")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"boss\" || @request.auth.role = \"admin\"\n",
    "deleteRule": "@request.auth.role = \"boss\" || @request.auth.role = \"admin\"\n",
    "listRule": "@request.auth.id != \"\"\n",
    "updateRule": "@request.auth.role = \"boss\" || @request.auth.role = \"admin\"\n"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3887672816")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null
  }, collection)

  return app.save(collection)
})
