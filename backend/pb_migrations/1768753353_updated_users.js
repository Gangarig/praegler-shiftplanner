/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"boss\" || @request.auth.role = \"admin\"\n",
    "deleteRule": "@request.auth.role = \"boss\" || @request.auth.role = \"admin\"\n",
    "listRule": "@request.auth.role = \"boss\" || @request.auth.role = \"admin\"\n",
    "updateRule": "@request.auth.id = id || \n@request.auth.role = \"boss\" || \n@request.auth.role = \"admin\"\n",
    "viewRule": "@request.auth.id = id || \n@request.auth.role = \"boss\" || \n@request.auth.role = \"admin\"\n"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "createRule": "",
    "deleteRule": "id = @request.auth.id",
    "listRule": "id = @request.auth.id",
    "updateRule": "id = @request.auth.id",
    "viewRule": "id = @request.auth.id"
  }, collection)

  return app.save(collection)
})
