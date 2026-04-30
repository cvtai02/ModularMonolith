using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Content.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBlogPostPublishing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "PublishedAt",
                table: "BlogPosts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BlogPosts_TenantId_Slug",
                table: "BlogPosts",
                columns: new[] { "TenantId", "Slug" },
                unique: true,
                filter: "\"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BlogPosts_TenantId_Slug",
                table: "BlogPosts");

            migrationBuilder.DropColumn(
                name: "PublishedAt",
                table: "BlogPosts");
        }
    }
}
