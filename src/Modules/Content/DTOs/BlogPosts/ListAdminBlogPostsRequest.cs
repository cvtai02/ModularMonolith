using Content.Core.Entities;

namespace Content.DTOs.BlogPosts;

public class ListAdminBlogPostsRequest : ListBlogPostsRequest
{
    public BlogPostStatus? Status { get; set; }
}
