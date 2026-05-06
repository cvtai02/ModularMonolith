namespace Inventory.Core.Exceptions;

public class InventoryReservationConflictException(string message) : Exception(message);
