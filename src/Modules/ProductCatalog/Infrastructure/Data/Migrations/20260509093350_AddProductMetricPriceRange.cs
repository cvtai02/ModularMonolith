using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProductCatalog.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProductMetricPriceRange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "HighestPrice",
                table: "ProductMetrics",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "LowestPrice",
                table: "ProductMetrics",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HighestPrice",
                table: "ProductMetrics");

            migrationBuilder.DropColumn(
                name: "LowestPrice",
                table: "ProductMetrics");
        }
    }
}
