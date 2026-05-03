using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Content.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBlogPostCollections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BlogPostCollections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Key = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlogPostCollections", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BlogPostCollectionItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BlogPostCollectionId = table.Column<int>(type: "integer", nullable: false),
                    BlogPostId = table.Column<int>(type: "integer", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlogPostCollectionItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BlogPostCollectionItems_BlogPostCollections_BlogPostCollect~",
                        column: x => x.BlogPostCollectionId,
                        principalTable: "BlogPostCollections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BlogPostCollectionItems_BlogPosts_BlogPostId",
                        column: x => x.BlogPostId,
                        principalTable: "BlogPosts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BlogPostCollectionItems_BlogPostCollectionId",
                table: "BlogPostCollectionItems",
                column: "BlogPostCollectionId");

            migrationBuilder.CreateIndex(
                name: "IX_BlogPostCollectionItems_BlogPostId",
                table: "BlogPostCollectionItems",
                column: "BlogPostId");

            migrationBuilder.CreateIndex(
                name: "IX_BlogPostCollectionItems_TenantId",
                table: "BlogPostCollectionItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BlogPostCollectionItems_TenantId_BlogPostCollectionId_BlogP~",
                table: "BlogPostCollectionItems",
                columns: new[] { "TenantId", "BlogPostCollectionId", "BlogPostId" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_BlogPostCollectionItems_TenantId_BlogPostCollectionId_Displ~",
                table: "BlogPostCollectionItems",
                columns: new[] { "TenantId", "BlogPostCollectionId", "DisplayOrder" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_BlogPostCollections_TenantId",
                table: "BlogPostCollections",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BlogPostCollections_TenantId_Key",
                table: "BlogPostCollections",
                columns: new[] { "TenantId", "Key" },
                unique: true,
                filter: "\"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BlogPostCollectionItems");

            migrationBuilder.DropTable(
                name: "BlogPostCollections");
        }
    }
}
