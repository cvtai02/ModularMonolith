# Internal Link Input Handoff

## Goal

Build a reusable internal link input component. Admin selects a link type, then the component loads and shows the matching list for that type.

Do not add new backend APIs for this. Use existing list/search APIs from the shared clients.

Supported link types:

- `Product`
- `Collection`
- `Category`
- `BlogPost`
- `BlogCollection`

## Suggested Component Value

```ts
type InternalLinkType =
  | "Product"
  | "Collection"
  | "Category"
  | "BlogPost"
  | "BlogCollection";

type InternalLinkValue = {
  type: InternalLinkType;
  refId: string;
  label: string;
  href: string;
  imageKey?: string | null;
};
```

For gallery items, save `value.href` into:

```ts
SaveGalleryItemRequest["link"]
```

## Product

Client:

```ts
productCatalogClient.listProduct({
  pageNumber,
  pageSize,
  search,
});
```

Response item type:

```ts
ProductSummaryResponse
```

Map:

```ts
{
  type: "Product",
  refId: product.id,
  label: product.name,
  href: `/products/${product.slug}`,
  imageKey: product.imageUrl
}
```

## Collection

Client:

```ts
productCatalogClient.listCollection({
  pageNumber,
  pageSize,
  search,
});
```

Map:

```ts
{
  type: "Collection",
  refId: String(collection.id),
  label: collection.title,
  href: `/collections/${collection.slug}`,
  imageKey: collection.imageKey
}
```

## Category

Client:

```ts
productCatalogClient.listCategory({
  pageNumber,
  pageSize,
  search,
});
```

Map:

```ts
{
  type: "Category",
  refId: category.name,
  label: category.name,
  href: `/categories/${category.slug}`,
  imageKey: category.imageKey
}
```

## Blog Post

Client:

```ts
contentClient.listAdminBlogPosts({
  pageNumber,
  pageSize,
  search,
});
```

Map:

```ts
{
  type: "BlogPost",
  refId: String(post.id),
  label: post.title,
  href: `/blog/${post.slug}`,
  imageKey: post.imageKey
}
```

## Blog Collection

Client:

```ts
contentClient.listAdminBlogPostCollections({
  pageNumber,
  pageSize,
  search,
});
```

Map:

```ts
{
  type: "BlogCollection",
  refId: collection.key,
  label: collection.title,
  href: `/blog/collections/${collection.key}`,
  imageKey: null
}
```

## UI Behavior

- Render a type selector first.
- Once a type is selected, load that type's list.
- Search box should call the selected type's list API with `search`.
- Show `label`, `href`, and image thumbnail when `imageKey` exists.
- Allow manual input too, because gallery item `link` can be a relative path or absolute URL.
- When admin selects an internal item, write only the relative `href` string into the parent form field.
- If existing value does not match a loaded internal option, display it as a custom link.

## Gallery Item Usage

```ts
type SaveGalleryItemRequest = {
  imageKey: string;
  displayOrder: number;
  name?: string | null;
  note?: string | null;
  link?: string | null;
};
```

Use `InternalLinkInput` for `link`.
