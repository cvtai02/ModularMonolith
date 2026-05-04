using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Content.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenameBlogPostImageUrlToImageKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ImageUrl",
                table: "BlogPosts",
                newName: "ImageKey");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ImageKey",
                table: "BlogPosts",
                newName: "ImageUrl");
        }
    }
}
