using Content.DTOs.BlogPosts;
using Content.Core.Entities;

namespace Content.Core.Usecases.BlogPosts;

public class CreateBlogPost(ContentDbContext db, BlogPostSlugGenerator slugGenerator)
{
    public async Task<BlogPostResponse> ExecuteAsync(CreateBlogPostRequest request, CancellationToken ct)
    {
        BlogPostValidation.Validate(request);

        var title = BlogPostValidation.NormalizeRequired(request.Title);
        var post = new BlogPost
        {
            Title = title,
            Slug = await slugGenerator.GenerateUniqueAsync(title, null, ct),
            Content = BlogPostValidation.NormalizeRequired(request.Content),
            Summary = BlogPostValidation.NormalizeOptional(request.Summary),
            ImageUrl = BlogPostValidation.NormalizeOptional(request.ImageUrl),
            Status = BlogPostStatus.Draft
        };

        db.BlogPosts.Add(post);
        await db.SaveChangesAsync(ct);

        return BlogPostMapper.ToResponse(post);
    }
}
