using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Inventory.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ChangeReservationSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_VariantInventories_VariantId",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_VariantId",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "VariantId",
                table: "Reservations");

            migrationBuilder.CreateTable(
                name: "ReservationLines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ReservationId = table.Column<int>(type: "integer", nullable: false),
                    VariantId = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReservationLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReservationLines_Reservations_ReservationId",
                        column: x => x.ReservationId,
                        principalTable: "Reservations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReservationLines_VariantInventories_VariantId",
                        column: x => x.VariantId,
                        principalTable: "VariantInventories",
                        principalColumn: "VariantId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReservationLines_ReservationId",
                table: "ReservationLines",
                column: "ReservationId");

            migrationBuilder.CreateIndex(
                name: "IX_ReservationLines_VariantId",
                table: "ReservationLines",
                column: "VariantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ReservationLines");

            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "Reservations",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "VariantId",
                table: "Reservations",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_VariantId",
                table: "Reservations",
                column: "VariantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_VariantInventories_VariantId",
                table: "Reservations",
                column: "VariantId",
                principalTable: "VariantInventories",
                principalColumn: "VariantId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
