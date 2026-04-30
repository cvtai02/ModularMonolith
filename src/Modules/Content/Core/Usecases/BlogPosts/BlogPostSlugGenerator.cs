using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.BlogPosts;

public class BlogPostSlugGenerator(ContentDbContext db)
{
    private static readonly Regex InvalidCharacters = new("[^a-z0-9\\s-]", RegexOptions.Compiled);
    private static readonly Regex Whitespace = new("[\\s-]+", RegexOptions.Compiled);

    public async Task<string> GenerateUniqueAsync(string title, int? excludedPostId, CancellationToken ct)
    {
        var baseSlug = Slugify(title);
        var slug = baseSlug;
        var suffix = 2;

        while (await SlugExistsAsync(slug, excludedPostId, ct))
        {
            slug = $"{baseSlug}-{suffix}";
            suffix++;
        }

        return slug;
    }

    public static bool LooksGeneratedFromTitle(string slug, string title)
    {
        var baseSlug = Slugify(title);
        return string.Equals(slug, baseSlug, StringComparison.OrdinalIgnoreCase) ||
               Regex.IsMatch(slug, $"^{Regex.Escape(baseSlug)}-[0-9]+$", RegexOptions.IgnoreCase);
    }

    private async Task<bool> SlugExistsAsync(string slug, int? excludedPostId, CancellationToken ct)
    {
        var query = db.BlogPosts
            .AsNoTracking()
            .Where(x => !x.IsDeleted && x.Slug == slug);

        if (excludedPostId.HasValue)
        {
            query = query.Where(x => x.Id != excludedPostId.Value);
        }

        return await query.AnyAsync(ct);
    }

    private static string Slugify(string value)
    {
        var normalized = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(normalized.Length);

        foreach (var character in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(character);
            if (category != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(character);
            }
        }

        var slug = builder.ToString().Normalize(NormalizationForm.FormC);
        slug = InvalidCharacters.Replace(slug, string.Empty);
        slug = Whitespace.Replace(slug, "-").Trim('-');

        return string.IsNullOrWhiteSpace(slug) ? "blog-post" : slug;
    }
}
