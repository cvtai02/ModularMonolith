using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Inventory.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ReferOrderCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OrderId",
                table: "Reservations");

            migrationBuilder.AddColumn<string>(
                name: "OrderCode",
                table: "Reservations",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OrderCode",
                table: "Reservations");

            migrationBuilder.AddColumn<int>(
                name: "OrderId",
                table: "Reservations",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
