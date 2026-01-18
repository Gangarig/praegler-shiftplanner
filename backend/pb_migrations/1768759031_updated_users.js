/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.id = id || @request.auth.role = \"boss\" || @request.auth.role = \"admin\"\n",
    "viewRule": "@request.auth.id = id || @request.auth.role = \"boss\" || @request.auth.role = \"admin\"\n"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.id = id || \n@request.auth.role = \"boss\" || \n@request.auth.role = \"admin\"\n",
    "viewRule": "@request.auth.id = id || \n@request.auth.role = \"boss\" || \n@request.auth.role = \"admin\"\n"
  }, collection)

  return app.save(collection)
})
