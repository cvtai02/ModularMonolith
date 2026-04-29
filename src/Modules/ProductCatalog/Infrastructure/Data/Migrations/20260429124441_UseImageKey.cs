using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProductCatalog.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UseImageKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Image",
                table: "Collections");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Categories");

            migrationBuilder.AddColumn<string>(
                name: "ImageKey",
                table: "Collections",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageKey",
                table: "Categories",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageKey",
                table: "Collections");

            migrationBuilder.DropColumn(
                name: "ImageKey",
                table: "Categories");

            migrationBuilder.AddColumn<string>(
                name: "Image",
                table: "Collections",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Categories",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
