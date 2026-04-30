using Content.Core.Entities;

namespace Content.Core.DTOs.BlogPosts;

public class ListAdminBlogPostsRequest : ListBlogPostsRequest
{
    public BlogPostStatus? Status { get; set; }
}
