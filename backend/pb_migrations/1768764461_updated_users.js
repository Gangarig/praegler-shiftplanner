/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"admin\" || @request.auth.role = \"boss\"\n",
    "deleteRule": "@request.auth.role = \"admin\" || @request.auth.role = \"boss\"\n",
    "listRule": "@request.auth.role = \"admin\" || @request.auth.role = \"boss\"\n",
    "updateRule": "@request.auth.id = id || @request.auth.role = \"admin\" || @request.auth.role = \"boss\"\n",
    "viewRule": "@request.auth.id = id || @request.auth.role = \"admin\" || @request.auth.role = \"boss\"\n"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"boss\" || @request.auth.role = \"admin\"\n",
    "deleteRule": "@request.auth.role = \"boss\" || @request.auth.role = \"admin\"\n",
    "listRule": "@request.auth.role = \"boss\" || @request.auth.role = \"admin\"\n",
    "updateRule": "@request.auth.id = id || @request.auth.role = \"boss\" || @request.auth.role = \"admin\"\n",
    "viewRule": "@request.auth.id = id || @request.auth.role = \"boss\" || @request.auth.role = \"admin\"\n"
  }, collection)

  return app.save(collection)
})
