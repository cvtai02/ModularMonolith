using Content.DTOs.BlogPosts;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.BlogPosts;

public class UpdateBlogPost(ContentDbContext db, BlogPostSlugGenerator slugGenerator)
{
    public async Task<BlogPostResponse?> ExecuteAsync(int id, UpdateBlogPostRequest request, CancellationToken ct)
    {
        BlogPostValidation.Validate(request);

        var post = await db.BlogPosts
            .ActiveOnly()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (post is null)
        {
            return null;
        }

        var title = BlogPostValidation.NormalizeRequired(request.Title);
        var shouldRegenerateSlug =
            !string.Equals(post.Title, title, StringComparison.Ordinal) &&
            BlogPostSlugGenerator.LooksGeneratedFromTitle(post.Slug, post.Title);

        post.Title = title;
        post.Content = BlogPostValidation.NormalizeRequired(request.Content);
        post.Summary = BlogPostValidation.NormalizeOptional(request.Summary);
        post.ImageUrl = BlogPostValidation.NormalizeOptional(request.ImageUrl);

        if (shouldRegenerateSlug)
        {
            post.Slug = await slugGenerator.GenerateUniqueAsync(title, post.Id, ct);
        }

        await db.SaveChangesAsync(ct);
        return BlogPostMapper.ToResponse(post);
    }
}
