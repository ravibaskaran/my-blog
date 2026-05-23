export function isPortableTextImageBlock(block) {
  return Boolean(block && typeof block === "object" && block._type === "image");
}

export function resolveLeadImageContent(post) {
  const body = Array.isArray(post?.body) ? post.body : [];
  const ogImage =
    post?.ogImage && typeof post.ogImage === "object" ? post.ogImage : null;

  if (ogImage) {
    return {
      leadImageSource: ogImage,
      leadImageAlt: post?.title ?? "",
      body,
    };
  }

  const leadImageIndex = body.findIndex(isPortableTextImageBlock);
  if (leadImageIndex === -1) {
    return {
      leadImageSource: null,
      leadImageAlt: "",
      body,
    };
  }

  const leadImageSource = body[leadImageIndex];
  return {
    leadImageSource,
    leadImageAlt: leadImageSource.alt || post?.title || "",
    body: body.filter((_, index) => index !== leadImageIndex),
  };
}
