/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getShoppingItem = /* GraphQL */ `
  query GetShoppingItem($id: ID!) {
    getShoppingItem(id: $id) {
      id
      user_id
      name
      shopping_date
      shop_name
      description
      status
      createdAt
      updatedAt
    }
  }
`;
export const listShoppingItems = /* GraphQL */ `
  query ListShoppingItems(
    $filter: ModelShoppingItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShoppingItems(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        user_id
        name
        shopping_date
        shop_name
        description
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
